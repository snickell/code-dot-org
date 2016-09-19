require 'cdo/db'
DB = PEGASUS_DB

# A wrapper class around the PEGASUS_DB[:properties] table.
class Properties
  @@table = DB[:properties]

  # @param key [String] the key to retrieve the value of.
  # @return [JSON] the value associated with key, nil if key does not exist.
  def self.get(key)
    i = @@table.where(key: key.to_s).first
    return nil unless i
    JSON.load(StringIO.new(i[:value]))
  end

  # @param key [String] the key to insert
  # @param value [String] the string to insert as JSON
  # @return [String] the value parameter
  def self.set(key, value)
    key = key.to_s

    i = @@table.where(key: key).first
    if i.nil?
      @@table.insert(key: key, value: value.to_json)
    else
      @@table.where(key: key).update(value: value.to_json)
    end

    value
  end

  # @param key [String] the key to delete.
  # @return [Integer] the number of rows deleted.
  def self.delete(key)
    @@table.where(key: key).delete
  end

  def self.get_user_metrics
    # Include stale default values as of 2016-06-22 so we never show 0. These
    # would be used, for example, if the DB is unavailable or the cron failed to
    # run properly.
    self.get(:about_stats) || {
      'percent_female' => 43,
      'number_served' => 256_924_978,
      'number_students' => 11_309_238,
      'number_teachers' => 340_979
    }
  end
end

def fetch_metrics
  # Include stale default values as of 2016-01-04 so we never show 0. These
  # would be used, for example, if the DB is unavailable.
  Properties.get(:metrics) || {
    'created_at' => "2016-01-04T21:37:19+00:00",
    'created_on' => "2016-01-04",
    'csedweek_organizers' => 38236,
    'csedweek_teachers' => 24025,
    'csedweek_entire_schools' => 12754,
    'csedweek_students' => 4_875_091,
    'csedweek_countries' => 356,
    'petition_signatures' => 2_053_571,
    'lines_of_code' => 11_151_730_618,
  }
end

def fetch_hoc_metrics
  # Include stale default values as of 2016-06-22 so we never show 0. These
  # would be used, for example, if the DB is unavailable or the cron failed to
  # run properly.
  Properties.get(:hoc_metrics) || {
    'started' => 256_924_978,
    'finished' => 36_270_398,
    # Generated from `fetch_hoc_metrics['tutorials'].select{|k,v| v > 1_000_000}`.
    'tutorials' => {
      'tynker' => 34_048_746,
      'codeorg' => 30_464_552,
      'mc' => 25_074_664,
      'flappy' => 22_061_190,
      'frozen' => 21_087_368,
      'hourofcode' => 15_681_963,
      'scratch' => 14_290_946,
      'tynkerapp' => 9_990_627,
      'starwarsblocks' => 9_705_040,
      'codecombat' => 6_486_255,
      'lightbot' => 5_507_452,
      'playlab' => 4_541_446,
      'khan' => 4_088_062,
      'starwars' => 3_686_644,
      'artist' => 3_305_952,
      'gumball' => 2_885_942,
      'codemonkey' => 2_606_176,
      'infinity' => 2_158_287,
      'makegameswithus' => 1_905_888,
      'codespark' => 1_652_414,
      'touchdevelop' => 1_590_553,
      'codecademy' => 1_347_761,
      'iceage' => 1_133_033
    },
    # Generated by `fetch_hoc_metrics['cities'].first(40).to_h`. Note that we
    # take the top forty, as that many cities are shown on the leaderboard.
    'cities' => {
      'Other' => 46_192_297,
      'Seattle' => 12_884_856,
      'Boardman' => 4_178_635,
      'Woodbridge' => 2_975_373,
      'Columbia' => 1_607_208,
      'Los Angeles' => 1_500_312,
      'San Jose' => 1_312_278,
      'London' => 1_296_034,
      'Durham' => 1_245_275,
      'Houston' => 1_119_635,
      'Springfield' => 1_117_588,
      'Taipei' => 1_071_271,
      'Tallahassee' => 979_383,
      'San Diego' => 882_350,
      'Chicago' => 859_685,
      'Raleigh' => 849_783,
      'Salt Lake City' => 808_512,
      'Las Vegas' => 783_382,
      'Athens' => 762_758,
      'Brooklyn' => 674_915,
      'Indianapolis' => 666_698,
      'Nashville' => 632_331,
      'Minneapolis' => 601_709,
      'Philadelphia' => 594_668,
      'Seoul' => 591_961,
      'Austin' => 585_930,
      'Lincoln' => 577_913,
      'San Antonio' => 560_663,
      'Everett' => 556_522,
      'Saint Paul' => 518_348,
      'Long Beach' => 476_517,
      'Annandale' => 472_666,
      'Bronx' => 472_515,
      'New York' => 472_070,
      'Denver' => 466_577,
      'Miami' => 456_996,
      'San Francisco' => 444_937,
      'Pompano Beach' => 439_588,
      'Toronto' => 439_470,
      'Ellicott City' => 437_999
    },
    # Generated by `fetch_hoc_metrics['countries'].first(40).to_h`. Note that we
    # take the top forty, as that many countries are shown on the leaderboard.
    'countries' => {
      'United States' => 157_468_553,
      'United Kingdom' => 14_129_010,
      'Other' => 9_906_366,
      'Canada' => 4_935_954,
      'Australia' => 3_143_077,
      'Turkey' => 2_924_411,
      'Italy' => 2_189_876,
      'Spain' => 1_932_139,
      'Korea, Republic of' => 1_883_001,
      'Brazil' => 1_871_295,
      'India' => 1_790_078,
      'Taiwan' => 1_720_650,
      'France' => 1_690_675,
      'Poland' => 1_546_991,
      'Ireland' => 1_534_825,
      'Mexico' => 1_444_120,
      'Greece' => 1_169_729,
      'Romania' => 1_092_913,
      'China' => 961_875,
      'Colombia' => 917_425,
      'Russian Federation' => 908_388,
      'Netherlands' => 818_949,
      'United Arab Emirates' => 784_575,
      'Finland' => 780_540,
      'Japan' => 755_093,
      'Germany' => 744_340,
      'Sweden' => 723_160,
      'Israel' => 717_605,
      'Vietnam' => 715_703,
      'New Zealand' => 675_043,
      'Ukraine' => 648_991,
      'Egypt' => 551_630,
      'Argentina' => 471_323,
      'Denmark' => 462_302,
      'Portugal' => 416_008,
      'Malaysia' => 406_281,
      'Philippines' => 390_225,
      'Hungary' => 387_757,
      'Thailand' => 378_919,
      'Belgium' => 366_067
    },
    # The count was reset to 0 in June 2016 as the result of moving to HOC2016
    # from HOC2015.
    'total_hoc_count' => 0,
    'total_codedotorg_count' => 141_985_796,
    'hoc_country_totals' => {},
    'hoc_company_totals' => {},
  }
end

def fetch_user_metrics
  Properties.get_user_metrics
end
