Rake::Task['db:test:prepare'].enhance do
  ActiveRecord::Base.establish_connection('test')
  Rake::Task['seed:test'].invoke
  ActiveRecord::Base.establish_connection(ENV['RAILS_ENV'])
end
