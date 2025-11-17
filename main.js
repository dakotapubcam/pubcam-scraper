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
import grandHotel from './venues/grandHotel.js';

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
  grandHotel,
];

function findVenueById(venueId) {
  return ALL_VENUES.find((v) => v.VENUE_ID === venueId);
}

Actor.main(async () => {
  const input = (await Actor.getInput()) || {};

  // Optional: restrict to some venues by VENUE_ID
  // input.venueIds = ["The Illawarra", "Humber Bar", ...]
  const { venueIds } = input;

  const venuesToRun = venueIds && venueIds.length
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
    // You can tune this later if needed
    maxConcurrency: 3,

    async requestHandler({ request, $, log }) {
      const { label, venueId, source } = request.userData || {};
      const venue = findVenueById(venueId);

      if (!venue) {
        log.warning(`No venue config found for venueId="${venueId}" (url: ${
