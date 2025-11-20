// venues/laLaLas.js

export default {
  VENUE_ID: "La La La's",
  SOURCE: "LaLaLasWeb",
  // Hit their events listing page directly
  START_URL: "https://www.lalalas.com.au/all-events/",

  async listPage($, request) {
    const events = [];

    // Only keep links that stay on lalalas.com.au
    $("a[href*='event'], a[href*='gig'], a[href*='shows'], a[href*='whats-on'], a[href*='whatson']")
      .each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        const absolute = new URL(href, request.loadedUrl).href;

        // Drop external ticketing links (Moshtix, Ticketmaster, etc.)
        if (absolute.includes("moshtix.com.au")) return;
        if (absolute.includes("ticketmaster.com.au")) return;
        if (absolute.includes("tixel.com")) return;

        events.push({
          url: absolute,
          label: "DETAIL",
        });
      });

    return events;
  },

  async detailPage($) {
    const text = (sel) => ($(sel).text() || "").trim();

    return {
      name: text("h1, .event-title"),
      description: text(".event-description, .content, p"),
      startDateTime:
        $("meta[property='event:startDate'], meta[itemprop='startDate']").attr("content") || "",
      endDateTime:
        $("meta[property='event:endDate'], meta[itemprop='endDate']").attr("content") || "",
      imageUrl: $("img").first().attr("src") || "",
      ticketUrl:
        $("a[href*='ticket'], a[href*='moshtix'], a[href*='oztix'], a[href*='trybooking']").attr(
          "href",
        ) || "",
    };
  },
};
