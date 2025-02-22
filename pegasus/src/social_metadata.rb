# Centralized social metadata for a few key pages:
#
#   code.org/
#   code.org/dance
#   code.org/minecraft
#   code.org/hourofcode/overview
#   code.org/hourofcode2022
#   code.org/maker
#   code.org/blockchain
#   code.org/ai
#   code.org/ai/pl/101
#   code.org/ai/how-ai-works
#   code.org/videos
#   code.org/youngwomen
#   code.org/music
#   code.org/lms
#
#   hourofcode.com site-wide

def get_social_metadata_for_page(request)
  images = {
    kids_with_ipads: {path: "/images/default-og-image.png", width: 1220, height: 640},
    mc_social_2018: {path: "/images/social-media/mc-social-2018.png", width: 1200, height: 630},
    dance_2023: {path: "/images/social-media/dance-social-2023-spring.png", width: 1200, height: 630},
    dance_2023_hoc: {path: "/images/social-media/dance-social-2023-hoc.png", width: 1200, height: 630},
    maker_physical_computing: {path: "/shared/images/social-media/maker_social.png", width: 1200, height: 630},
    blockchain: {path: "/shared/images/social-media/blockchain-social.png", width: 1200, height: 630},
    ai: {path: "/shared/images/social-media/ai-social.png", width: 1200, height: 630},
    ai_101: {path: "/shared/images/social-media/ai-101-social.png", width: 1200, height: 630},
    ai_how_ai_works: {path: "/shared/images/social-media/ai-how-ai-works-social.png", width: 1200, height: 630},
    hoc_2024_social: {path: "/shared/images/social-media/hoc2024_social.png", width: 1200, height: 630},
    videos_page: {path: "/shared/images/social-media/videos-page.png", width: 1200, height: 630},
    young_women_in_cs: {path: "/shared/images/social-media/young-women-social.png", width: 1200, height: 630},
    music_lab: {path: "/shared/images/social-media/music-lab.png", width: 1200, height: 630},
    music_lab_jam: {path: "/shared/images/social-media/music-lab-jam.png", width: 1200, height: 630},
    lms: {path: "/shared/images/social-media/lms.png", width: 1200, height: 630},
  }

  # Important:
  #   - description should always come before description_twitter
  #   - to apply an image that shows up specifically on Twitter,
  #     use the "image_twitter" key after the "image" key
  social_tags = {
    "code.org" => {
      "default" => {
        title: hoc_s(:hoc2019_header),
        description: I18n.t(:og_description),
        image: images[:kids_with_ipads]
      }
    },
    "hourofcode.com" => {
      "default" => {
        title: hoc_s("hoc_2024.social.v2.title"),
        description: hoc_s("hoc_2024.social.v2.desc"),
        image: images[:hoc_2024_social]
      }
    },
    "minecraft" => {
      "default" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s("hoc_page.activities.minecraft.desc"),
        image: images[:mc_social_2018]
      }
    },
    "dance" => {
      "default" => {
        title: hoc_s(:social_hoc2018_dance_party),
        description: hoc_s(:social_hoc2023_dance_v2),
        image: images[:dance_2023_hoc]
      }
    },
    "hoc-overview" => {
      "default" => {
        title: hoc_s("hoc_2024.social.title"),
        description: hoc_s("hoc_2024.social.desc"),
        image: images[:hoc_2024_social]
      }
    },
    "maker" => {
      "default" => {
        title: hoc_s(:social_maker_title),
        description: hoc_s(:social_maker_desc),
        image: images[:maker_physical_computing]
      }
    },
    "blockchain" => {
      "default" => {
        title: hoc_s(:social_blockchain_title),
        description: hoc_s(:social_blockchain_desc),
        image: images[:blockchain]
      }
    },
    "ai" => {
      "default" => {
        title: hoc_s(:social_ai_title),
        description: hoc_s(:social_ai_desc),
        image: images[:ai]
      }
    },
    "ai_101" => {
      "default" => {
        title: hoc_s(:ai_pl_101_hero_heading),
        description: hoc_s(:ai_pl_101_hero_desc),
        image: images[:ai_101]
      }
    },
    "ai_how_ai_works" => {
      "default" => {
        title: hoc_s(:how_ai_works_hero_heading),
        description: hoc_s(:how_ai_works_hero_desc),
        image: images[:ai_how_ai_works]
      }
    },
    "videos_page" => {
      "default" => {
        title: hoc_s(:video_library_page_main_title),
        description: hoc_s(:social_videos_desc),
        image: images[:videos_page]
      }
    },
    "young_women_in_cs" => {
      "default" => {
        title: hoc_s(:yw_page_top_heading),
        description: hoc_s(:yw_page_top_desc),
        image: images[:young_women_in_cs]
      }
    },
    "music_lab" => {
      "default" => {
        title: hoc_s("music_lab.opengraph_title", markdown: :inline, locals: {music_lab: "Music Lab"}),
        description: hoc_s("music_lab.jam_session.banner.desc_01"),
        image: images[:music_lab_jam]
      }
    },
    "lms" => {
      "default" => {
        title: hoc_s("lms_page.heading"),
        description: hoc_s("lms_page.top_desc"),
        image: images[:lms]
      }
    },
  }

  if request.site == "hourofcode.com"
    page = request.site
  elsif request.path == "/" && request.site == "code.org"
    page = request.site
  elsif request.path == "/minecraft" && request.site == "code.org"
    page = "minecraft"
  elsif request.path == "/dance" && request.site == "code.org"
    page = "dance"
  elsif request.path == "/hourofcode" && request.site == "code.org"
    page = "hoc-overview"
  elsif request.path == "/maker" && request.site == "code.org"
    page = "maker"
  elsif request.path == "/blockchain" && request.site == "code.org"
    page = "blockchain"
  elsif request.path == "/ai" && request.site == "code.org"
    page = "ai"
  elsif request.path == "/ai/pl/101" && request.site == "code.org"
    page = "ai_101"
  elsif request.path == "/ai/how-ai-works" && request.site == "code.org"
    page = "ai_how_ai_works"
  elsif request.path == "/educate/resources/videos" && request.site == "code.org"
    page = "videos_page"
  elsif request.path == "/youngwomen" && request.site == "code.org"
    page = "young_women_in_cs"
  elsif request.path == "/music" && request.site == "code.org"
    page = "music_lab"
  elsif request.path == "/lms" && request.site == "code.org"
    page = "lms"
  else
    return {}
  end

  social_tag_set =
    social_tags[page]["default"]

  output = {}
  social_tag_set.each do |name, value|
    case name
    when :image
      output["og:image"] = "https://#{request.host}#{value[:path]}"
      output["twitter:image:src"] = "https://#{request.host}#{value[:path]}" unless social_tag_set.include?(:image_twitter)
      output["og:image:width"] = value[:width]
      output["og:image:height"] = value[:height]
      output["twitter:card"] = "photo"
    when :image_twitter
      output["twitter:image:src"] = "https://#{request.host}#{value[:path]}"
    when :video
      output["og:video:url"] = "http://youtube.com/v/#{value[:youtube_key]}"
      output["og:video:secure_url"] = "https://youtube.com/v/#{value[:youtube_key]}"
      output["og:video:type"] = "video/mp4"
      output["og:video:width"] = value[:width]
      output["og:video:height"] = value[:height]
      output["twitter:player"] = "https://youtube.com/embed/#{value[:youtube_key]}"
      output["twitter:player:width"] = value[:width]
      output["twitter:player:height"] = value[:height]
      output["twitter:card"] = "player"
    when :title
      output["og:title"] = value
      output["twitter:title"] = value
    when :description
      output["og:description"] = value
      output["twitter:description"] = value
    when :description_twitter
      output["twitter:description"] = value
    end
  end

  output
end
