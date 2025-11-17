// venues/harpHotel.js

export default {
  VENUE_ID: "Harp Hotel",
  SOURCE: "HarpHotelWeb",
  START_URL: "https://harphotel.com.au/events/",

  async listPage($, request) {
    const events = [];

    $("a[href*='event'], a[href*='events'], a[href*='whatson'], a[href*='whats-on']").each((_, el) => {
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
      name: text("h1, .event-title"),
      description: text(".event-description, .content, p"),
      startDateTime: $("meta[property='event:startDate'], meta[itemprop='startDate']").attr("content") || "",
      endDateTime: $("meta[property='event:endDate'], meta[itemprop='endDate']").attr("content") || "",
      imageUrl: $("img").first().attr("src") || "",
      ticketUrl: $("a[href*='ticket'], a[href*='moshtix'], a[href*='oztix'], a[href*='trybooking']").attr("href") || "",
    };
  },
};
