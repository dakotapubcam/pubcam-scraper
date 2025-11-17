// venues/uniBar.js

export default {
  VENUE_ID: "UniBar",
  SOURCE: "UniBarWeb",
  START_URL: "https://unibar.uow.edu.au/gigs-events/",

  async listPage($, request) {
    const events = [];

    $("a[href*='event'], a[href*='gig'], a[href*='show'], a[href*='tickets']").each((_, el) => {
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
      name: text("h1, .gig-title, .event-title"),
      description: text(".gig-description, .event-description, .content, p"),
      startDateTime: $("meta[property='event:startDate'], meta[itemprop='startDate']").attr("content") || "",
      endDateTime: $("meta[property='event:endDate'], meta[itemprop='endDate']").attr("content") || "",
      imageUrl: $("img").first().attr("src") || "",
      ticketUrl: $("a[href*='ticket'], a[href*='moshtix'], a[href*='oztix'], a[href*='trybooking']").attr("href") || "",
    };
  },
};
