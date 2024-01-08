from pathlib import Path

import sitebuilder


def main() -> None:
    sB = sitebuilder.SiteBuilder("src", "build")
    sB.build()

if __name__ == "__main__":
    main()