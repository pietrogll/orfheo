describe ReposFactory do

  before(:all){
    ReposFactory.new(@db).create_repo :db_key, "MyClass"
  }


  describe 'create_repo' do

    let(:common_repos_methods){[
        :save,
        :modify,
        :get,
        :delete,
        :exists?,
        :all,
        :get_by_id,
        :get_owner,
        :delete_many,
        :clear
      ].sort}

		it 'creates a new class in the module Repos' do
			expect(Repos.const_defined? :MyClass).to eq true
			expect(Repos::MyClass.class).to eq Class
		end

		it 'provides the created class with the class methods: common_repos_methods' do
			class Array
			  def contains_all? other
			    other = other.dup
			    each{|e| if i = other.index(e) then other.delete_at(i) end}
			    other.empty?
			  end
			end
			expect(Repos::MyClass.methods.contains_all?(common_repos_methods)).to eq true
		end

	end

	describe 'created Repo Class' do
		let(:element){
			{
				id: 'element_id',
				attribute: 'attribute',
				other_attribute: 'other_attribute'
			}
		}

		it 'saves and gets an element in the database collection' do
			Repos::MyClass.save element
			element_saved = Repos::MyClass.get({id: 'element_id'}).first

			expect(element_saved).to eq element 
		end

		it 'modifies an element in the database collection' do
			Repos::MyClass.save element
			Repos::MyClass.modify({
				id: 'element_id', 
				attribute: 'modified_attribute'
			})

			element_saved = Repos::MyClass.get({id: 'element_id'}).first

			expect(element_saved[:attribute]).to eq 'modified_attribute'
		end

		it 'deletes an element in the database collection' do
			Repos::MyClass.save element
			Repos::MyClass.delete('element_id')

			element_saved = Repos::MyClass.get({id: 'element_id'}).first

			expect(element_saved).to eq nil
		end

		it 'checks if an element exists' do
			Repos::MyClass.save element
			allow(UUID).to receive(:validate).and_return true

			expect(Repos::MyClass.exists? 'element_id').to eq true
		end

		it 'gets all element of the database' do
			otter_element = element.deep_dup
			otter_element[:id] = 'otter_element_id'
			Repos::MyClass.save element
			Repos::MyClass.save otter_element

			all_elements_saved = Repos::MyClass.all

			expect(all_elements_saved).to eq [element, otter_element]
		end

		it 'gets by id an element in the database collection' do
			Repos::MyClass.save element

			element_saved =  Repos::MyClass.get_by_id 'element_id'

			expect(element_saved).to eq element 
		end

		it 'deletes many elements depending on attr' do
			otter_element = element.deep_dup
			otter_element[:id] = 'otter_element_id'
			Repos::MyClass.save element
			Repos::MyClass.save otter_element

			Repos::MyClass.delete_many({attribute:'attribute'})
			all_elements_saved = Repos::MyClass.all

			expect(all_elements_saved).to be_empty
		end

		it 'gets owner (user_id) of an element' do
			element[:user_id] = 'user_id'
			Repos::MyClass.save element
			
			owner_id = Repos::MyClass.get_owner('element_id')

			expect(owner_id).to eq 'user_id'
		end

		it 'clears the repos deleting all elements' do
			otter_element = element.deep_dup
			otter_element[:id] = 'otter_element_id'
			Repos::MyClass.save element
			Repos::MyClass.save otter_element

			Repos::MyClass.clear
			all_elements_saved = Repos::MyClass.all

			expect(all_elements_saved).to be_empty
		end

	end


end
