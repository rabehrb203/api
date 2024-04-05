const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
// const compression = require("compression");

const app = express();
const port = 3000;
// app.use(compression());
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// API endpoint for getting a list of manga titles and links
app.get("/manga/titles", async (req, res) => {
  const base_url = "https://mangarose.net/manga/page/";
  const max_page = 1; // تحديد عدد الصفحات

  let manga_titles = [];
  let promises = [];

  try {
    for (let page = 1; page <= max_page; page++) {
      const url = base_url + page + "/";
      promises.push(axios.get(url));
    }

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      const $ = cheerio.load(response.data);
      const items = $(".col-6.col-md-2.badge-pos-1");

      items.each((index, element) => {
        const manga_title = $(element).find("h3.h5").text().trim();
        const manga_cover = $(element).find("img").attr("src");

        const manga_title_link = $(element)
          .find("a")
          .attr("href")
          .substring(28);

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
      "https://mangarose.net/manga/" + manga_link
    );
    const $ = cheerio.load(response.data);
    const chapters = $(".page-content-listing .wp-manga-chapter");

    let manga_chapters = [];
    chapters.each((index, element) => {
      const chapter_number = $(element).find("a").text().trim();
      const chapter_link = $(element).find("a").attr("href");
      const chapter_date = $(element).find("span").text().trim();
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
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5',
  'cookie': 'wpmanga-reading-history=W3siaWQiOjMzMDMsImMiOiI0OTE2NjEiLCJwIjoxLCJpIjoiIiwidCI6MTcxMjI1MTE3MH0seyJpZCI6NTQyLCJjIjoiMjAzMzciLCJwIjoxLCJpIjoiIiwidCI6MTcxMjI2MDM2OH1d; cf_clearance=VRNUDP.HTNmpgMK.E5d53_oJFqytn.saGHXZSeahLIQ-1712328028-1.0.1.1-9IedFmnayA3n6h0ApS7yL1XJEnTB0OXm_.sPIXWWrdCHqB8I1MnMTsIMvmHHLxrXL4yNr44QfkYsuSXN7IlgKw',
  'dnt': '1',
  'if-modified-since': 'Fri, 22 Mar 2024 07:10:34 GMT',
  'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'sec-ch-ua-arch': '"x86"',
  'sec-ch-ua-bitness': '"64"',
  'sec-ch-ua-full-version': '"123.0.6312.106"',
  'sec-ch-ua-full-version-list': '"Google Chrome";v="123.0.6312.106", "Not:A-Brand";v="8.0.0.0", "Chromium";v="123.0.6312.106"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-model': '""',
  'sec-ch-ua-platform': '"Windows"',
  'sec-ch-ua-platform-version': '"15.0.0"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'upgrade-insecure-requests': '1',
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
