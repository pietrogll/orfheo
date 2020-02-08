describe Services::Encryptor do
    
    A_STRING = 'a_string'
    
    it 'creates an encrypted string form A_STRING and allows comparison with A_STRING' do
        encrypted_string = Services::Encryptor.encrypt A_STRING
        expect(Services::Encryptor.check_equality(encrypted_string, A_STRING)).to be true
    end



end
