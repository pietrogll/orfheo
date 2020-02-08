describe 'Services::Search Events' do
  
  let(:event_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_event_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb84'}
  let(:other_event_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb85'}
  let(:o_event_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb86'}

  let(:event_name){'event name'}
  let(:otter_event_name){'otter name'}
  let(:other_event_name){'other event name'}
  let(:o_event_name){'o_event_name'}

  let(:event){{
    id: event_id,
    name: event_name,
    eventTime: [
      {
        'date': '2018-10-26',
        'time': ['1540533600000', '1540576800000']
      },
      {
        'date': '2018-10-29',
        'time': ['1540796400000', '1540825200000']
      }
    ]
  }}

  let(:otter_event){{
    id: otter_event_id,
    name: otter_event_name,
    eventTime: [
      {
        'date': '2018-12-17',
        'time': ['1545033600000', '1545076800000']
      },
      {
        'date': '2018-12-18',
        'time': ['1545120000000','1545163200000']
      },
      {
        'date': '2018-12-19',
        'time': ['1545206400000', '1545249600000']
      }
    ]
  }}

  let(:other_event){{
    id: other_event_id,
    name: other_event_name,
    eventTime: [
      {
        'date': '2018-11-20',
        'time': ['1542708000000','1542744000000']
      }
    ]
  }}

  let(:o_event){{
    id: o_event_id,
    name: o_event_name,
    eventTime: [
      {
        'date': '2018-01-02',
        'time': ['1514887200000', '1514912400000']
      }
    ]
  }}

  describe 'get_results for events' do

    SAMPLE_EVENTS_SIZE = 15

    before(:each){
      (SAMPLE_EVENTS_SIZE / 2).times do
        new_event = event.deep_dup
        new_event[:id] = SecureRandom.uuid
        Repos::Events.save(new_event)
      end
      (SAMPLE_EVENTS_SIZE / 2).times do
        new_otter_event = otter_event.deep_dup
        new_otter_event[:id] = SecureRandom.uuid
        Repos::Events.save(new_otter_event)
      end
      (SAMPLE_EVENTS_SIZE / 2).times do
        new_other_event = other_event.deep_dup
        new_other_event[:id] = SecureRandom.uuid
        Repos::Events.save(new_other_event)
      end
      (SAMPLE_EVENTS_SIZE / 2).times do
        new_o_event = o_event.deep_dup
        new_o_event[:id] = SecureRandom.uuid
        Repos::Events.save(new_o_event)
      end
    }

    let(:intit_pull_params){
      {
        first_half_results: true
      }
    }

    let(:db_key){'events'}        

    it 'gets SAMPLE_EVENTS_SIZE events' do
      allow(Time).to receive(:now).and_return Time.new(2018, 7, 8)

      results, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results.size).to eq SAMPLE_EVENTS_SIZE
    end

    it 'orders future events by proximity to current time' do
      allow(Time).to receive(:now).and_return Time.new(2018, 7, 8)
      expected_names = []
      7.times { expected_names.push(event_name) }
      7.times { expected_names.push(other_event_name) }
      expected_names.push(otter_event_name)

      results, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      results_name = results.map{|ev| ev[:name]}
     
      expect(results_name).to eq expected_names
    end

    it 'orders past events by proximity to current time' do
      allow(Time).to receive(:now).and_return Time.new(2019, 7, 8)
      expected_names = []
      7.times { expected_names.push(otter_event_name) }
      7.times { expected_names.push(other_event_name) }
      expected_names.push(event_name)

      results, pull_params = Services::Search.get_results({first_half_results: false}, db_key)
      results_name = results.map{|ev| ev[:name]} 

      expect(results_name).to eq expected_names
    end

    it 'provides future events and then past events by proximity to current time - test 1 -' do
      allow(Time).to receive(:now).and_return Time.new(2018, 11, 8) 
      expected_names = []
      7.times { expected_names.push(other_event_name) }
      7.times { expected_names.push(otter_event_name) }
      expected_names.push(event_name)

      results, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      results_name = results.map{|ev| ev[:name]} 

      expect(results_name).to eq expected_names
    end

    it 'provides future events and then past events by proximity to current time  - test 2 -' do
      allow(Time).to receive(:now).and_return Time.new(2018, 11, 30) 
      expected_names = []
      7.times { expected_names.push(otter_event_name) }
      7.times { expected_names.push(other_event_name) }
      expected_names.push(event_name)

      results, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      results_name = results.map{|ev| ev[:name]} 

      expect(results_name).to eq expected_names
    end
    
  end


end