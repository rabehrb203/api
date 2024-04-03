const express = require("express");
const request = require("request");
const cheerio = require("cheerio");

const app = express();

// API endpoint for getting a list of manga titles and links
app.get("/manga/titles", async (req, res) => {
  const base_url = "https://mangarose.net/manga/page/";
  const max_page = 63; // Specify the number of pages

  const manga_titles = [];

  try {
    for (let page = 1; page <= max_page; page++) {
      const url = base_url + page + "/";
      const response = await request.get(url);

      const $ = cheerio.load(response.body);
      const content_listing = $(".page-content-listing.item-big_thumbnail");

      if (content_listing.length) {
        const items = content_listing.find(".col-6.col-md-2.badge-pos-1");

        items.each((i, item) => {
          const manga_title = $(item).find("h3.h5").text().trim();
          const manga_link = $(item).find("a").attr("href");
          manga_titles.push({ title: manga_title, link: manga_link });
        });
      }
    }
    res.json(manga_titles);
  } catch (e) {
    res.status(500).json({ error: `An error occurred: ${e}` });
  }
});

// API endpoint for getting details of a specific manga
app.get("/manga/details/:manga_link", async (req, res) => {
  const manga_link = req.params.manga_link;

  try {
    const manga_response = await request.get(manga_link);

    const $ = cheerio.load(manga_response.body);
    const post_content = $(".post-content");
    const other_info_section = post_content.find(".post-content_item");

    const other_info = {};
    other_info_section.each((i, info) => {
      const heading = $(info).find("h5").text().trim();
      const content = $(info).find(".summary-content").text().trim();
      other_info[heading] = content;
    });

    res.json(other_info);
  } catch (e) {
    res.status(500).json({ error: `An error occurred: ${e}` });
  }
});

// API endpoint for getting chapters of a specific manga
app.get("/manga/chapters/:manga_link", async (req, res) => {
  const manga_link = req.params.manga_link;

  try {
    const manga_response = await request.get(manga_link);

    const $ = cheerio.load(manga_response.body);
    const chapters_section = $(".page-content-listing");
    const chapters = chapters_section.find("li.wp-manga-chapter");

    const manga_chapters = [];

    chapters.each((i, chapter) => {
      const chapter_number = $(chapter).find("a").text().trim();
      const chapter_link = $(chapter).find("a").attr("href");
      const chapter_date = $(chapter).find("span").text().trim();

      manga_chapters.push({
        number: chapter_number,
        link: chapter_link,
        date: chapter_date,
      });
    });

    res.json(manga_chapters);
  } catch (e) {
    res.status(500).json({ error: `An error occurred: ${e}` });
  }
});

// API endpoint for getting images of a specific chapter
app.get("/manga/images/:chapter_link", async (req, res) => {
  const chapter_link = req.params.chapter_link;

  try {
    const chapter_response = await request.get(chapter_link);

    const $ = cheerio.load(chapter_response.body);
    const images_container = $(".reading-content");
    const images = images_container.find("img.wp-manga-chapter-img");

    const chapter_images = [];

    images.each((i, image) => {
      const image_url = $(image).attr("src").trim();
      chapter_images.push(image_url);
    });

    res.json(chapter_images);
  } catch (e) {
    res.status(500).json({ error: `An error occurred: ${e}` });
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
