# Envoy configuration

```yaml
admin:
  access_log_path: "/dev/null"
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 9901
static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 10000
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                generate_request_id: true
                tracing:
                    provider:
                      name: envoy.tracers.zipkin
                      typed_config:
                        "@type": type.googleapis.com/envoy.config.trace.v3.ZipkinConfig
                        collector_cluster: zipkin
                        collector_endpoint: "/api/v2/spans"
                        collector_endpoint_version: HTTP_JSON
                access_log:
                  - name: envoy.access_loggers.file
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog                       
                      log_format:
                         json_format:
                            time: "%START_TIME%"
                            protocol: "%PROTOCOL%"
                            duration: "%DURATION%"
                            request_method: "%REQ(:METHOD)%"
                            request_host: "%REQ(HOST)%"
                            path: "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%"
                            response_flags: "%RESPONSE_FLAGS%"
                            route_name: "%ROUTE_NAME%"
                            upstream_host: "%UPSTREAM_HOST%"
                            upstream_cluster: "%UPSTREAM_CLUSTER%"
                            upstream_local_address: "%UPSTREAM_LOCAL_ADDRESS%"
                         content_type: "text/html; charset=UTF-8"
                      path: "/tmp/access.log"
                http_filters:
                  - name: envoy.filters.http.router
                route_config:
                  name: routes
                  virtual_hosts:
                    - name: microservices
                      domains: ["*"]
                      cors:
                        allow_origin_string_match:
                        - safe_regex:
                            google_re2: {}
                            regex: \*
                        allow_methods: "GET, POST, PUT, DELETE"
                        allow_headers: "authorization, content-type, x-requestid, x-requested-with"
                        allow_credentials: true
                      routes:
                        - name: "aggregator"
                          match:
                            prefix: "/a/"
                          route:
                            auto_host_rewrite: true
                            prefix_rewrite: "/"
                            cluster: aggregator

                        - name: "orders"
                          match:
                            prefix: "/o/"
                          route:
                            prefix_rewrite: "/"
                            cluster: orders

                        - name: "products"
                          match:
                            prefix: "/p/"
                          route:
                            cluster: products
                            prefix_rewrite: "/"

                        - name: "store"
                          match:
                            prefix: "/s/"
                          route:
                            cluster: store
                            prefix_rewrite: "/"
  clusters:
  - name: aggregator
    connect_timeout: 1s
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
        cluster_name: aggregator
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: aggregator                      
                      port_value: 2000

  - name: orders
    connect_timeout: 15s
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
        cluster_name: orders
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: orders
                      port_value: 4000

  - name: products
    connect_timeout: 15s
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
        cluster_name: products
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: products
                      port_value: 5000

  - name: store
    connect_timeout: 1s
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
        cluster_name: store
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: store
                      port_value: 600

  - name: zipkin
    connect_timeout: 1s
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
        cluster_name: zipkin
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: zipkin
                      port_value: 9411
```