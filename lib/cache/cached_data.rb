class InstanceCache

    def initialize
      @cache = ActiveSupport::Cache::MemoryStore.new
    end
    # (expires_in: 5.minutes)

    def write key, value
      @cache.write(key, value)
    end

    def read key
      @cache.read(key)
    end

    def delete key
      @cache.delete(key)
    end

    def clear
      @cache.clear
    end

end

class BaseCache

  class << self

    @@cache = ActiveSupport::Cache::MemoryStore.new
    # (expires_in: 5.minutes)

    def write key, value
      @@cache.write(key, value)
    end

    def read key
      @@cache.read(key)
    end

    def delete key
      @@cache.delete(key)
    end

    def clear
      @@cache.clear
    end

  end

end


class CachedEvent < BaseCache

  class << self

    @@cached_program = @@cache

    def program event_id
      @@cached_program.fetch(event_id) do get_cached_program event_id
      end
    end
    
    def program_hosts event_id
      @@cached_program.fetch("hosts_#{event_id}") do get_cached_program_hosts event_id
      end
    end

    def delete event_id
      @@cached_program.delete(event_id)
      @@cached_program.delete("hosts_#{event_id}")
    end

    private

    def get_cached_program event_id
      program = @@cached_program.read(event_id)
      program ||= get_event_program(event_id) 
    end

    def get_event_program event_id
      event = Repos::Events.get_by_id event_id
      Services::Programs.arrange_program event[:program_id]
    end

    def get_cached_program_hosts event_id
      hosts = @@cached_program.read("hosts_#{event_id}")
      hosts ||= get_program_hosts(event_id) 
    end

    def get_program_hosts event_id
      hosts_identifiers = []
      program(event_id).inject([]) do |accumulator, performance|
        identifier = performance[:host_id]+performance[:host_name]
        if !hosts_identifiers.include?(identifier)
          accumulator << performance 
          hosts_identifiers << identifier
        end
        accumulator 
      end
    end

  end

end
