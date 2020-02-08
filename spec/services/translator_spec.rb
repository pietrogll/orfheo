describe Services::Translator do

	let(:input_key){:a_key}
	let(:another_input_key){:another_key}


	let(:nested_key){"nested.key"}

	let(:translated_text){'Translated text'}
	ANOTHER_TEXT = 'Another translated text'
	NESTED_TEXT = 'Nested text'
	
	let(:dictionary){
		{				
			:nested => {
				:key => NESTED_TEXT
			},
			input_key => translated_text,
			another_input_key => 	ANOTHER_TEXT
		}
	}

	let(:translator){Services::Translator.new nil, dictionary}

	

	it 'returns a text' do	
		# translator = Services::Translator.new nil, dictionary

		text_translated = translator.translate input_key

		expect(text_translated).to eq translated_text
	end

	it 'returns a text depending on the input key' do		
		text_translated = translator.translate another_input_key

		expect(text_translated).to eq ANOTHER_TEXT
	end

	it 'can be initiated with a class and a lang' do

		DICTIONARY = dictionary

		class DicClass

			def self.[] lang
				DicClass.send(lang)
			end
			
			def self.lang 
				DICTIONARY
			end
		end


		translator_by_class = Services::Translator.new(:lang, DicClass)
		text_translated = translator_by_class.translate input_key

		expect(text_translated).to eq translated_text

	end

	it 'dials with nested string keys' do
		
		text_translated = translator.translate nested_key

		expect(text_translated).to eq NESTED_TEXT

	end

	


end


describe Dictionary do

	PAYLOAD = {:key => 'payload_value'}
	
	let(:payload){PAYLOAD}

	it 'returns texts depending the language symbol' do
		dictionary = Dictionary[:es]
		expect(dictionary[:email][:welcome][:subject]).to eq 'Bienvenido/a a orfheo'

	end
	

	it 'can be loaded with payloads' do
		
		Dictionary.load(payload)
	
		expect(Dictionary.payload).to eq PAYLOAD

	end

end