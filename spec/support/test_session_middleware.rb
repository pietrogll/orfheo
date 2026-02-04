# Custom session store for test environment that avoids rack-session-2.1.1 issues
# This middleware provides a simple hash-based session that works with Rails

class SimpleTestSession < Hash
  def initialize(*args)
    super
    @id = SecureRandom.hex(16)
  end

  def id
    @id
  end

  def enabled?
    true
  end

  def loaded?
    true
  end

  def exists?
    true
  end
end

class TestSessionMiddleware
  def initialize(app)
    @app = app
  end

  def self.session
    Thread.current[:test_session] ||= SimpleTestSession.new
  end

  def self.reset_session!
    Thread.current[:test_session] = nil
  end

  def call(env)
    # Use thread-local session that persists across requests in the same test
    session = TestSessionMiddleware.session

    env['rack.session'] = session
    env['rack.session.options'] = { id: session.id }
    env['action_dispatch.request.session'] = session

    status, headers, body = @app.call(env)

    [status, headers, body]
  end
end
