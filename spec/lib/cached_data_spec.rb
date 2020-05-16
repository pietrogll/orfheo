describe 'Caches'  do 


	describe 'InstanceCache' do

	
		it 'writes, reads and deletes a value' do
			cache = InstanceCache.new
			cache.write('my_key','my_value')
			expect(cache.read('my_key')).to eq 'my_value'
			cache.delete('my_key')
			expect(cache.read('my_key')).to eq nil
		end

	end

	

	describe 'BaseCache' do

		before(:all){
			BaseCache.clear
		}
	
		it 'writes and reads a value' do
			BaseCache.write('my_key', 'my_value')
			expect(BaseCache.read('my_key')).to eq 'my_value'
		end

		it 'reads a value previously stored' do
			expect(BaseCache.read('my_key')).to eq 'my_value'
		end

		it 'deletes a key and its value' do
			BaseCache.delete('my_key')
			expect(BaseCache.read('my_key')).to eq nil
		end

	end


	describe 'CachedEvent' do

		before(:all){
			BaseCache.clear
			CachedEvent.clear
		}

		before(:each){
			Repos::Events.save ({id: 'event_id', program_id: 'program_id'})
		}
	
		it 'writes and reads a value' do
			CachedEvent.write('program_event_id', 'my_value')
			expect(CachedEvent.read('program_event_id')).to eq 'my_value'
		end

		it 'reads a value previously stored' do
			expect(CachedEvent.read('program_event_id')).to eq 'my_value'
		end

		it 'deletes a key and its value' do
			CachedEvent.delete('event_id')
      expect(CachedEvent.read('program_event_id')).to eq nil
		end

    it 'does not make the program up if cached' do
      program_data_key = 'program_event_id'
      CachedEvent.write(program_data_key, {})
      expect(Services::Programs).not_to receive(:arrange_program)
      CachedEvent.program('event_id')
    end

    context 'if the program is not cached' do
      let(:program){ 'program' }

      before do
        CachedEvent.clear
        allow(Services::Programs).to receive(:arrange_program).and_return(program)
      end

  		it 'makes the program up and stores it' do
  			expect(Services::Programs).to receive(:arrange_program).with('program_id')
  			CachedEvent.program('event_id')
  			expect(CachedEvent.program('event_id')).to eq(program)
  		end

      it 'adds a new timestamp to the program' do
        mocked_time = Time.new(2022, 10, 31)
        allow(Time).to receive(:now).and_return(mocked_time)
        expected_millisec_timestamp = (mocked_time.to_f*1000).to_i
        timestamp = CachedEvent.program_timestamp('event_id')
        expect(timestamp).to eq(expected_millisec_timestamp)
      end
    end
	end

end