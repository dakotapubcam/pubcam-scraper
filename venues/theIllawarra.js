// venues/theIllawarra.js

export default {
  VENUE_ID: "The Illawarra",
  SOURCE: "TheIllawarraWeb",
  START_URL: "https://www.theillawarra.com.au/the-events",

  async listPage($, request) {
    const events = [];

    // Try generic links that look like events
    $("a[href*='event'], a[href*='music'], a[href*='whats-on'], a[href*='whatson']").each((_, el) => {
      const url = $(el).attr("href");
      if (!url) return;
      events.push({
        url: url.startsWith("http") ? url : new URL(url, request.loadedUrl).href,
        label: "DETAIL",
      });
    });

    return events;
  },

  async detailPage($) {
    const text = (sel) => ($(sel).text() || "").trim();

    return {
      name: text("h1, .event-title, .headline"),
      description: text("p, .event-description"),
      startDateTime: $("meta[property='event:startDate'], meta[itemprop='startDate']").attr("content") || "",
      endDateTime: $("meta[property='event:endDate'], meta[itemprop='endDate']").attr("content") || "",
      imageUrl: $("img").first().attr("src") || "",
      ticketUrl: $("a[href*='ticket'], a[href*='book'], a[href*='moshtix'], a[href*='oztix']").attr("href") || "",
    };
  },
};
