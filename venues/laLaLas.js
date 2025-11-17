// venues/laLaLas.js

export default {
  VENUE_ID: "La La La's",
  SOURCE: "LaLaLasWeb",
  START_URL: "https://www.lalalas.com.au/",

  async listPage($, request) {
    const events = [];

    // A lot of music bars mark gig tiles with links containing "event" or similar
    $("a[href*='event'], a[href*='gig'], a[href*='shows'], a[href*='whats-on'], a[href*='whatson']").each((_, el) => {
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
