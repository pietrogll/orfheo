module Services
  class DbElement
    class << self
        
      def check_existence! db_key, id
        raise Pard::Invalid::Params if id.blank? || ApiStorage.repos(db_key).blank?
        raise Pard::Invalid::UnexistingDbEl unless ApiStorage.repos(db_key).exists? id
      end

      def modify db_key, params
        ApiStorage.repos(db_key).modify params
      end

      def get_by_id db_key, id
        ApiStorage.repos(db_key).get_by_id id        
      end

      def get_public_info db_key, id
        public_info_storage = ApiStorage::PublicInfo.new db_key
        pipeline = public_info_storage.pipeline_for id
        ApiStorage.repos(db_key).collect(pipeline).first
      end

    end 
  end
end