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
      fetch_cached_program_data(event_id)[:program]
    end

    def program_timestamp event_id
      fetch_cached_program_data(event_id)[:program_timestamp]
    end
    
    def program_hosts event_id
      @@cached_program.fetch(hosts_key(event_id)) do get_cached_program_hosts event_id
      end
    end

    def delete event_id
      @@cached_program.delete(program_key(event_id))
      @@cached_program.delete(hosts_key(event_id))
    end

    def write_program_with_timestamp event_id, program
      write(event_id, program_with_timestamp)
    end

    private

    def program_key event_id
      "program_#{event_id}"
    end

    def hosts_key event_id
      "hosts_#{event_id}"
    end

    def fetch_cached_program_data event_id
      @@cached_program.fetch(program_key(event_id)) do
        program = get_event_program(event_id)
        program_with_timestamp(program)
      end
    end

    def program_with_timestamp program
      timestamp = (Time.now.to_f*1000).to_i
      {program: program, program_timestamp: timestamp}
    end

    def get_event_program event_id
      event = Repos::Events.get_by_id event_id
      Services::Programs.arrange_program event[:program_id]
    end

    def get_cached_program_hosts event_id
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
