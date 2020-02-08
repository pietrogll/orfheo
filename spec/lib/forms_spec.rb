describe 'Forms'  do 


	describe 'new Forms' do

		# let(:formManager){FormsManager.new('user_id', params)}

		it 'raise invalid params if blocks field blank' do
			params = {type: 'artist', blocks: {}, texts:'texts'}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Params)
		end

		it 'raise invalid params if type field missed' do
			params = {blocks: 'blocks', type: '', texts:'texts'}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Params)
		end

		it 'raise invalid params if texts field blank' do
			params = {blocks: 'blocks', type: 'artist'}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Params)
		end

		it 'raise invalid blocks if not the same for any language (artist)' do
			params = {
				type: 'artist',
				blocks: {es: {field1: {}, field2:{}}, ca:{field1: {}}},
				texts: 'texts' 
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Blocks)
		end

		it 'raise invalid blocks if not the same for any language (space)' do
			params = {
				type: 'space',
				blocks: {es: {field1: {}, field2:{}}, ca:{field1: {}}},
				texts:'texts' 
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Blocks)
		end

		it 'raise invalid blocks if not mandatory blocks_field (artist)' do
			params = {
				type: 'artist',
				blocks: {es: {field1: {}}, ca:{field1: {}}},
				texts:'texts'  
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Blocks)
		end

		it 'raise invalid blocks if not mandatory blocks_field (space)' do
			params = {
				type: 'artist',
				blocks: {es: {field1: {}}, ca:{field1: {}}},
				texts:'texts'  
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::Blocks)
		end

		it 'raise invalid FormsTexts if not the same for any language' do
			params = {
				type: 'space',
				blocks: {es: {subcategory: 'subcategory'}},
				texts: {es: {label: 'label', helptexts: 'pippo'}, ca: {label: 'pippo'}}  
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::FormsTexts)
		end

		it 'raise invalid FormsTexts if not mandatory texts_field' do
			params = {
				type: 'space',
				blocks: {es: {subcategory: 'subcategory'}},
				texts: {es: {helptexts: 'pippo'}}  
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.to raise_error(Pard::Invalid::FormsTexts)
		end

		it 'does NOT raise invalid blocks if ok mandatory blocks_fields (space)' do
			params = {
				type: 'space',
				blocks: {es: {subcategory: 'subcategory'}, ca:{subcategory: 'subcategory'}},
				texts: {es: {label: 'label', helptexts: 'pippo'}}  
			}
			formManager = FormsManager.new('user_id', params)
			expect{formManager.create}.not_to raise_error
		end

	end
end