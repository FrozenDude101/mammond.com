import sitebuilder


def main() -> None:
    sB = sitebuilder.SiteBuilder("source", "build")
    sB.addTemplates("templates")
    sB.build()

if __name__ == "__main__":
    main()