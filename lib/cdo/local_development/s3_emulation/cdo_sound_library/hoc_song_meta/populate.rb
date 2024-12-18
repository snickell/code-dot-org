require 'tempfile'
require_relative '../../populator'

# Dance Party - Song Metadata
#
# This generates the Dance Party metadata files that describe the available
# songs. This is generally held in the cdo-sound-library S3 bucket.
class CdoSoundLibrary::HocSongMeta::Populate
  include Populator

  # The API path that maps to the bucket
  API_PATH = '/api/v1/sound-library/hoc_song_meta'

  TEST_MUSIC_URL = 'https://curriculum.code.org/media/uploads/synthesize.mp3'.freeze
  TEST_MUSIC_BPM = 110.0

  def ffmpeg?
    unless defined?(@ffmpeg)
      @ffmpeg = !!system('which ffmpeg > /dev/null')
    end

    @ffmpeg
  end

  def generate_music_file(file_name, bpm, delay)
    puts "Creating #{file_name} with #{bpm} bpm and #{delay} delay"

    # Download the 'synthesize' music file which is in 110 bpm
    url = 'https://curriculum.code.org/media/uploads/synthesize.mp3'
    Tempfile.create([file_name, '.mp3']) do |generated_file|
      file_path = generated_file.path

      # If we have ffmpeg support, we can get the music to match its metadata.
      if ffmpeg?
        # Get the relative speed as a percentage of the test music
        speed = bpm / TEST_MUSIC_BPM

        # Use ffmpeg to add delay and to speed up / slow down test music to match bpm
        ffmpeg_command = "ffmpeg -y -i #{url} -af atempo=#{speed},adelay=\"#{delay}|#{delay}\" #{file_path}"

        # Output generated audio to specified path
        system ffmpeg_command
      else
        # Just use the test music at the wrong dimensions
        puts "WARN: No ffmpeg available! The sound files might not be in sync with metadata."
        response = HTTParty.get(url)
        raise "ERROR: Cannot find synthesize.mp3" unless response.code == 200
        generated_file.binmode
        generated_file.write(response.body)
        generated_file.close
      end

      # Ensure we write the audio data to the cdo-restricted bucket
      put('cdo-restricted', "restricted/#{file_name}", -> {File.read(file_path)})
    end
  end

  # Hook into the populate call to produce the appropriate mp3 as well
  def populate(path = nil)
    data = super(path)

    unless path.nil? || path.include?('songManifest') || path.include?('testManifest')
      # This is song metadata so we want some song as well
      metadata = JSON.parse(data)
      song_path = metadata['file']
      file_name = File.basename(song_path)
      bpm = metadata['bpm'].to_f
      delay = metadata['delay'].to_f * 1000
      generate_music_file(file_name, bpm, delay)
    end

    data
  end

  def populate_all
    data = JSON.parse(populate("songManifest2024_v2.json"))

    # Write out the song metadata
    data["songs"].each do |info|
      id = info["id"]
      populate("#{id}.json")
    end
  end
end
