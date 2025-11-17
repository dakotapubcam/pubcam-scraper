// venues/prince.js

export default {
  VENUE_ID: "The Prince",
  SOURCE: "ThePrinceWeb",
  START_URL: "https://www.theprincewollongong.com/whats-on",

  async listPage($, request) {
    const events = [];
    $("a[href*='event'], a[href*='whats']").each((_, el) => {
      const url = $(el).attr("href");
      if (!url) return;
      events.push({ url: url.startsWith("http") ? url : `${request.loadedUrl}${url}`, label: "DETAIL" });
    });
    return events;
  },

  async detailPage($) {
    const text = (sel) => ($(sel).text() || "").trim();
    return {
      name: text("h1"),
      description: text("p"),
      startDateTime: $("meta[property='event:startDate']").attr("content") || "",
      endDateTime: $("meta[property='event:endDate']").attr("content") || "",
      imageUrl: $("img").first().attr("src") || "",
      ticketUrl: $("a[href*='ticket']").attr("href") || "",
    };
  }
};
