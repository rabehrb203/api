const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
// const compression = require("compression");

const app = express();
const port = 3000;
// app.use(compression());
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// API endpoint for getting a list of manga titles and links
app.get("/manga/titles/:page_num", async (req, res) => {
  const base_url = "https://thunderscans.com/manga/?page=${page_num}";
  const max_page = 1; // تحديد عدد الصفحات

  let manga_titles = [];
  let promises = [];

  try {
    // for (let page = 1; page <= max_page; page++) {
      // const url = base_url + page + "/";
      // promises.push(axios.get(url));
    // }
      promises.push(axios.get(base_url));

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      const $ = cheerio.load(response.data);
      const items = $(".bs");

      items.each((index, element) => {
        const manga_title = $(element).find("div.tt").text().trim();
        const manga_cover = $(element).find("img").attr("src");

        const manga_title_link = $(element)
          .find("a")
          .attr("href")
          .substring(31);

        manga_titles.push({
          title: manga_title,
          cover: manga_cover,
          dir_link: manga_title_link,
        });
      });
    });

    res.json(manga_titles);
  } catch (error) {
    res.status(500).json({ error: `An error occurred: ${error}` });
  }
});
// API endpoint for getting details of a specific manga
app.get("/manga/details/:manga_link", async (req, res) => {
  const manga_link = req.params.manga_link;

  try {
    const response = await axios.get(
      "https://mangarose.net/manga/" + manga_link
    );
    const $ = cheerio.load(response.data);
    const other_info_section = $(".post-content .post-content_item");
    const other_info_section2 = $(".post-status .post-content_item");

    let other_info = {};

    other_info_section.each((index, element) => {
      const heading = $(element)
        .find("h5")
        .text()
        .trim()
        .replace("تقييم", "rating")
        .replace("التصنيفات", "categories")
        .replace("المرتبة", "rank")
        .replace("النوع", "type")
        .replace("أسماء أخرى", "otherNames");
      const content = $(element).find(".summary-content").text().trim();
      other_info[heading] = content;
    });
    other_info_section2.each((index, element) => {
      const heading = $(element)
        .find("h5")
        .text()
        .trim()
        .replace("الإصدار", "release")
        .replace("الحالة", "status");
      const content = $(element).find(".summary-content").text().trim();
      other_info[heading] = content;
    });

    // Convert the set back to an object

    res.json(other_info);
  } catch (error) {
    res.status(500).json({ error: `An error occurred: ${error}` });
  }
});

// API endpoint for getting chapters of a specific manga
app.get("/manga/chapters/:manga_link", async (req, res) => {
  const manga_link = req.params.manga_link;

  try {
    const response = await axios.get(
      "https://thunderscans.com/manga/" + manga_link
    );
    const $ = cheerio.load(response.data);
    const chapters = $(".eplister #aa");

    let manga_chapters = [];
    chapters.each((index, element) => {
      const chapter_number = $(element).find("span.chapternum").text().trim();
      const chapter_link = $(element).find("a.aa").attr("href");
      const chapter_date = $(element).find("span.chapterdate").text().trim();
      manga_chapters.push({
        number: chapter_number,
        link: chapter_link,
        date: chapter_date,
      });
    });

    res.json(manga_chapters);
  } catch (error) {
    res.status(500).json({ error: `An error occurred: ${error}` });
  }
});
// API endpoint for getting images of a specific chapter
app.get("/manga/images/:manga_title/:chapter_number", async (req, res) => {
  const manga_title = req.params.manga_title;
  const chapter_number = req.params.chapter_number;

  try {

   const chapter_link = `https://lekmanga.net/manga/${manga_title}/${chapter_number}/`;
   const headers = {

  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
};

const response = await axios.get(chapter_link, {
  headers: headers
});

    const images = $(".reading-content .wp-manga-chapter-img");

    let chapter_images = [];
    images.each((index, element) => {
      const image_url = $(element).attr("src").trim();
      chapter_images.push(image_url);
    });

    res.json(chapter_images);
  } catch (error) {
    res.status(500).json({ error: `An error occurred: ${error}` });
  }
});
app.get("/myip", (req, res) => {
  const clientIP = req.ip;
  res.send(`Your IP address is: ${clientIP}`);
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
