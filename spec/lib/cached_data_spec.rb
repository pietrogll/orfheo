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
			CachedEvent.write('my_key', 'my_value')
			expect(CachedEvent.read('my_key')).to eq 'my_value'
		end

		it 'reads a value previously stored' do
			expect(CachedEvent.read('my_key')).to eq 'my_value'
		end

		it 'deletes a key and its value' do
			CachedEvent.delete('my_key')
			expect(CachedEvent.read('my_key')).to eq nil
		end

		it 'makes the program up if not cached and stores it' do
			CachedEvent.clear
			expect(Services::Programs).to receive(:arrange_program).with('program_id').and_return('program')
			CachedEvent.program('event_id')
			expect(CachedEvent.read('event_id')).to eq('program')
		end

		it 'does not make the program up if cached' do
			expect(Services::Programs).not_to receive(:arrange_program)
			CachedEvent.program('event_id')
		end

	end

end