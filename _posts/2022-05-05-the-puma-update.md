---
layout: post
title: The puma update
---

Puma is a web server written in Ruby. At WeTransfer we rely on it for our "download server". "Download server" is in quotations because it is in essence a download server that, when the final byte has been processed, sends an email upon completion to the original uploader. The download server at WeTransfer had a security vulnerability because of the puma gem we use. We had pinned its version to 5.0.1 because of - what I can only describe as - a hacky way to inject statistics about each individual workers.

## The hack
The hack can be reduced to the following amount of code. It's quite a bit of code but bear with me:

```ruby
# config.ru

module ConnectionCounter
  CONNECTIONS_MUTEX = Mutex.new
  CONNECTIONS = {}

  def self.count
    CONNECTIONS_MUTEX.synchronize do
      CONNECTIONS.length
    end
  end

  def self.add(id:, values: {})
    CONNECTIONS_MUTEX.synchronize do
      CONNECTIONS[id] = values
    end
  end

  def self.delete(id:)
    CONNECTIONS_MUTEX.synchronize do
      CONNECTIONS.delete(id)
    end
  end
end

module ExtendedStats
  def stats
    super.merge(
      connection_count: ConnectionCounter.count,
      custom_value: "CustomValue"
    )
  end
end

Puma::Server.prepend(ExtendedStats)

run -> (env) {
  ConnectionCounter.add(id: id, values: { abc: "123" })
  sleep 3600 # Fake the idea of a long running download
  ConnectionCounter.delete(id: id)
  [200, {}, [env.inspect]]
}
```

As you can see, we prepend a certain Ruby module into the `Puma::Server` class to override the `stats` method. To elaborate how intricate this is: the `stats` go through a ping loop (essentially a loop that sends a bunch of data from the worker to the master puma process). Eventually this ends up in a method that is called the `Puma.stats_hash`. This hash is used to pry individual data out of it and

```ruby
# puma.rb
preload_app!
workers 4
threads 4

class ConnectionsPlugin
  def start(launcher)
    connections_app = Rack::Builder.app do
      map "/connections" do
        run ->(_env) {
          response = {
            connection_count: ConnectionCounter.count
          }

          [
            200,
            {'Content-Type' => 'application/json'},
            [JSON.pretty_generate(response) + "\n"]
          ]
        }
      end
    end
  end

  connections_port = ENV.fetch('PUMA_HEALTHCHECKS_PORT', 9398)
  bind_to_url_str = "tcp://0.0.0.0:#{connections_port}"
  uri = URI.parse(bind_to_url_str)

  connections_server = Puma::Server.new(
    connections_app,
    launcher.events
  )
  connections_server.min_threads = 0
  connections_server.max_threads = 1
  connections_server.add_tcp_listener(uri.host, uri.port)

  launcher.events.register(:state) do |state|
    if %i[halt restart stop].include?(state)
      unless connections_server.shutting_down?
        connections_server.stop(true)
      end
    end
  end

  connections_server.run
end

Puma::Plugins.register "connections", ConnectionsPlugin
plugin "connections"
```

