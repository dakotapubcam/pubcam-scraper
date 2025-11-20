// main.js — PubCam multi-venue scraper (Apify Actor, ESM)

import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

import theIllawarra from './venues/theIllawarra.js';
import humberBar from './venues/humberBar.js';
import prince from './venues/prince.js';
import bevanda from './venues/bevanda.js';
import heyday from './venues/heyday.js';
import harpHotel from './venues/harpHotel.js';
import howlinWolf from './venues/howlinWolf.js';
import laLaLas from './venues/laLaLas.js';
import uniBar from './venues/uniBar.js';
import halfwayHotel from './venues/halfwayHotel.js';
import barCabron from './venues/barCabron.js';
// import grandHotel from './venues/grandHotel.js'; // Moshtix – handled later

const INTAKE_URL =
  'https://pubcam-intake-805112904135.australia-southeast1.run.app/intake';

// All venue configs in one place
const ALL_VENUES = [
  theIllawarra,
  humberBar,
  prince,
  bevanda,
  heyday,
  harpHotel,
  howlinWolf,
  laLaLas,
  uniBar,
  halfwayHotel,
  barCabron,
  // grandHotel,
];

function findVenueById(venueId) {
  return ALL_VENUES.find((v) => v.VENUE_ID === venueId);
}

Actor.main(async () => {
  const input = (await Actor.getInput()) || {};
  const { venueIds } = input;

  const venuesToRun =
    venueIds && venueIds.length
      ? ALL_VENUES.filter((v) => venueIds.includes(v.VENUE_ID))
      : ALL_VENUES;

  if (!venuesToRun.length) {
    throw new Error('No venues selected to run.');
  }

  const requestQueue = await Actor.openRequestQueue();

  // Seed: one LIST request per venue
  for (const venue of venuesToRun) {
    if (!venue.START_URL) {
      console.warn(`Skipping venue without START_URL: ${venue.VENUE_ID}`);
      continue;
    }

    await requestQueue.addRequest({
      url: venue.START_URL,
      userData: {
        label: 'LIST',
        venueId: venue.VENUE_ID,
        source: venue.SOURCE,
      },
    });
  }

  const crawler = new CheerioCrawler({
    requestQueue,
    maxConcurrency: 3,

    async requestHandler({ request, $, log }) {
      const { label, venueId, source } = request.userData || {};
      const venue = findVenueById(venueId);

      if (!venue) {
        log.warning(`No venue config found for venueId="${venueId}" (url: ${request.url})`);
        return;
      }

      // ---------------- LIST PAGE ----------------
      if (!label || label === 'LIST') {
        if (typeof venue.listPage !== 'function') {
          log.warning(`Venue "${venueId}" missing listPage()`);
          return;
        }

        const next = (await venue.listPage($, request)) || [];

        for (const item of next) {
          if (!item?.url) continue;

          await requestQueue.addRequest({
            url: item.url,
            userData: {
              label: item.label || 'DETAIL',
              venueId,
              source,
            },
          });
        }

        log.info(`LIST processed for ${venueId}, queued ${next.length} detail URLs`);
        return;
      }

      // ---------------- DETAIL PAGE ----------------
      if (label === 'DETAIL') {
        if (typeof venue.detailPage !== 'function') {
          log.warning(`Venue "${venueId}" missing detailPage()`);
          return;
        }

        const detail = (await venue.detailPage($, request)) || {};

        const {
          name = '',
          description = '',
          startDateTime = '',
          endDateTime = '',
          imageUrl = '',
          ticketUrl = '',
          priceRange = '',
        } = detail;

        const payload = {
          venueId,
          source,
          name,
          description,
          startDateTime,
          endDateTime,
          imageUrl,
          ticketUrl,
          priceRange,
          scrapedUrl: request.url,
        };

        // ---- 1) Send to Cloud Run intake ----
        try {
          const res = await fetch(INTAKE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            let bodyText = '';
            try {
              bodyText = await res.text();
            } catch (_) {
              // ignore
            }
            log.error(
              `Intake failed for ${venueId} (${res.status} ${res.statusText}) url=${request.url} body=${bodyText}`,
            );
          } else {
            log.info(`Intake OK for ${venueId}: ${name || '(no title)'}`);
          }
        } catch (err) {
          log.error(`Intake request ERROR for ${venueId} at ${request.url}: ${err?.message}`);
        }

        // ---- 2) Also push into Apify dataset for debugging ----
        await Actor.pushData(payload);
      }
    },
  });

  await crawler.run();
});
