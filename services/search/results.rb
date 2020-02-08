module Services
  
  class Search

    class << self

      def get_results pull_params, db_key, query=nil
        query ||= {}
        queries_performer = QueryPerformer.new(db_key, query)
        repo_collection = ApiStorage.repos(db_key)
        puller = DbPuller.new(repo_collection, pull_params, queries_performer)
        puller.get
      end

    end

    private

    class QueryPerformer

      def initialize db_key, custom_query
        @custom_query = custom_query
        @storage = ApiStorage::QueriesStore.new(db_key)
      end

      def build params
        default_query = params.blank? ? {} : @storage.get_default_query(params) 
        build_query(default_query)
      end

      def execute skip, limit, query        
        query_executer = @storage.get_query_executer
        @storage.send(query_executer, skip, limit, query)
      end

      def custom_query
        @custom_query
      end

      def new_starting_db_position n_results
         @storage.new_starting_db_position(n_results)
      end

      private

      def build_query default_query
        default_query.merge @custom_query      
      end

    end


    class DbPuller

      N_WANTED = 15

      def initialize repo_collection, pull_params, queries_performer
        @pull_params = pull_params
        @repo_collection = repo_collection
        @queries_performer = queries_performer
      end

      def get
        reload_pull_params! if first_pull? 
        return [ [], @pull_params] if pull_completed?
        few_remainders? ? pull_check : pull
      end

      private
      
      def pull n_wanted = N_WANTED
        return [ [], @pull_params ] if n_wanted <= 0
        
        results = @queries_performer.execute(@pull_params[:db_position], n_wanted, @queries_performer.build(@pull_params))
        @pull_params[:db_position] += results.count
        if results.count < n_wanted
          @pull_params[:db_position] = n_wanted - results.count 
          results += @queries_performer.execute(0, @pull_params[:db_position], @queries_performer.build(@pull_params))
        end
        @pull_params[:n_pulled] += results.count

        [results, @pull_params]
      end

      def pull_check 
        remainders, @pull_params = pull(n_remainders)  
        return [remainders, @pull_params] if pull_completed?

        @pull_params[:first_half_results] = !@pull_params[:first_half_results]
        reload_pull_params!
        n_completions = how_many_to_complete?(remainders)
        completions, @pull_params  = pull(n_completions)

        results = remainders + completions
        [results, @pull_params]
      end

      def first_pull?
        @pull_params[:n_pulled].nil?
      end

      def pull_completed?
        @pull_params[:n_pulled] ||= 0 
        @pull_params[:n_total] ||= @repo_collection.count(@queries_performer.custom_query)
        @pull_params[:n_pulled] == @pull_params[:n_total]
      end

      def few_remainders?
        n_remainders <= N_WANTED
      end

      def how_many_to_complete? remainders
        [N_WANTED - remainders.count, n_remainders].min
      end

      def n_remainders
        [n_remainders_from_total, n_remainder_from_results].min
      end

      def reload_pull_params!
        query = @queries_performer.build(@pull_params)
        @pull_params[:starting_db_position] = new_starting_db_position(query)
        @pull_params[:db_position] = @pull_params[:starting_db_position] 
      end
      
      def new_starting_db_position query
        n_results = @repo_collection.count(query)
        @pull_params[:n_results] = n_results
        n_results == 0 ? n_results : @queries_performer.new_starting_db_position(n_results)
      end

      def n_remainders_from_total
        @pull_params[:n_total] - @pull_params[:n_pulled]
      end

      def n_remainder_from_results
        distance_from_starting_pos = @pull_params[:starting_db_position] - @pull_params[:db_position]
        distance_from_starting_pos > 0 ? distance_from_starting_pos : @pull_params[:n_results] + distance_from_starting_pos
      end

    end 

  end

end

