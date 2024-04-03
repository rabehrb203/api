from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

# API endpoint for getting a list of manga titles and links
@app.route('/manga/titles')
def get_manga_titles():
    base_url = 'https://mangarose.net/manga/page/'
    max_page = 63  # تحديد عدد الصفحات

    manga_titles = []

    try:
        for page in range(1, max_page + 1):
            url = base_url + str(page) + '/'
            response = requests.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            content_listing = soup.find('div', class_='page-content-listing item-big_thumbnail')

            if content_listing:
                items = content_listing.find_all('div', class_='col-6 col-md-2 badge-pos-1')

                for item in items:
                    manga_title = item.find('h3', class_='h5').text.strip()
                    manga_link = item.find('a')['href']
                    manga_titles.append({"title": manga_title, "link": manga_link})
        return jsonify(manga_titles)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500
# API endpoint for getting details of a specific manga
@app.route('/manga/details/<path:manga_link>')
def get_manga_details(manga_link):
    try:
        manga_response = requests.get(manga_link)
        manga_response.raise_for_status()

        manga_soup = BeautifulSoup(manga_response.text, 'html.parser')
        post_content = manga_soup.find('div', class_='post-content')
        other_info_section = post_content.find_all('div', class_='post-content_item')

        other_info = {}
        for info in other_info_section:
            heading = info.find('h5').text.strip()
            content = info.find('div', class_='summary-content').text.strip()
            other_info[heading] = content

        return jsonify(other_info)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

# API endpoint for getting chapters of a specific manga
@app.route('/manga/chapters/<path:manga_link>')
def get_manga_chapters(manga_link):
    try:
        manga_response = requests.get(manga_link)
        manga_response.raise_for_status()

        manga_soup = BeautifulSoup(manga_response.text, 'html.parser')
        chapters_section = manga_soup.find('div', class_='page-content-listing')
        chapters = chapters_section.find_all('li', class_='wp-manga-chapter')

        manga_chapters = []

        for chapter in chapters:
            chapter_number = chapter.a.text.strip()
            chapter_link = chapter.a['href']    
            chapter_date = chapter.find('span').text.strip()

            manga_chapters.append({"number": chapter_number, "link": chapter_link, "date": chapter_date})

        return jsonify(manga_chapters)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500
@app.route('/manga/images/<path:chapter_link>')
def get_chapter_images(chapter_link):
    try:
        chapter_response = requests.get(chapter_link)
        chapter_response.raise_for_status()

        chapter_soup = BeautifulSoup(chapter_response.text, 'html.parser')
        images_container = chapter_soup.find('div', class_='reading-content')
        images = images_container.find_all('img', class_='wp-manga-chapter-img')

        chapter_images = []

        for image in images:
            image_url = image['src'].strip()
            chapter_images.append(image_url)

        return jsonify(chapter_images)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500
if __name__ == '__main__':
    app.run(debug=True)
