// venues/grandHotel.js

export default {
  VENUE_ID: "The Grand Hotel",
  SOURCE: "GrandHotelWeb",
  // Using Moshtix venue page as the primary events source
  START_URL: "https://www.moshtix.com.au/v2/venues/the-grand-hotel-wollongong/2287",

  async listPage($, request) {
    const events = [];

    // Moshtix-style event links usually contain "/v2/event" or "events"
    $("a[href*='/v2/event'], a[href*='event'], a[href*='events']").each((_, el) => {
      const url = $(el).attr("href");
      if (!url) return;

      events.push({
        url: url.startsWith("http")
          ? url
          : new URL(url, request.loadedUrl).href,
        label: "DETAIL",
      });
    });

    return events;
  },

  async detailPage($) {
    const text = (sel) => ($(sel).text() || "").trim();

    return {
      name: text("h1, .event-title"),
      description: text(".event-description, .content, .event-copy, p"),
      startDateTime:
        $("meta[property='event:startDate'], meta[itemprop='startDate']").attr("content") || "",
      endDateTime:
        $("meta[property='event:endDate'], meta[itemprop='endDate']").attr("content") || "",
      imageUrl: $("img").first().attr("src") || "",
      ticketUrl:
        $("a[href*='ticket'], a[href*='moshtix'], a[href*='tixel'], a[href*='eventbrite']").attr(
          "href",
        ) || "",
    };
  },
};
