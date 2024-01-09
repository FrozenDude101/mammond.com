![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/FrozenDude101/mammond.com/github-pages.yml?style=flat&label=build%20%26%20deploy)
![GitHub License](https://img.shields.io/github/license/FrozenDude101/mammond.com)
# mammond.com
## Introduction
This repo is for my site, [mammond.com](https://mammond.com), which is hopefully still up. 🤞
## Installation
The easiest way to work on this site locally is by using a virtual environment and Python 3.12.
1. Clone the repo.
2. Navigate to your local copy.
3. `python -m venv .venv`
4. `.venv/bin/activate`
   * `.venv\Scripts\activate` on Windows
5. `pip install -r requirements.txt`
## Usage
To build and view the site locally, run
```
python main.py && python -m http.server -d build
```
Then go to [localhost](http://localhost:8000).
## Contributing
Contributions are welcome, mainly to the [sitebuilder](https://github.com/FrozenDude101/sitebuilder) itself, but also to any of the content on the site.
Feel free to make an issue and/or a pull request with your suggestions.
