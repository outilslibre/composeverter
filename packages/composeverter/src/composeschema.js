export const dockerComposeCommonSpecSchema = {
    $id: 'compose_spec.json',
    type: 'object',
    title: 'Compose Specification',
    description: 'The Compose file is a YAML file defining a multi-containers based application.',

    properties: {
        version: {
            type: 'string',
            description: 'declared for backward compatibility, ignored.',
        },

        name: {
            type: 'string',
            pattern: '^[a-z0-9][a-z0-9_-]*$',
            description: 'define the Compose project name, until user defines one explicitly.',
        },

        include: {
            type: 'array',
            items: {
                type: 'object',
                $ref: '#/definitions/include',
            },
            description: 'compose sub-projects to be included.',
        },

        services: {
            $id: '#/properties/services',
            type: 'object',
            patternProperties: {
                '^[a-zA-Z0-9._-]+$': {
                    $ref: '#/definitions/service',
                },
            },
            additionalProperties: false,
        },

        networks: {
            $id: '#/properties/networks',
            type: 'object',
            patternProperties: {
                '^[a-zA-Z0-9._-]+$': {
                    $ref: '#/definitions/network',
                },
            },
        },

        volumes: {
            $id: '#/properties/volumes',
            type: 'object',
            patternProperties: {
                '^[a-zA-Z0-9._-]+$': {
                    $ref: '#/definitions/volume',
                },
            },
            additionalProperties: false,
        },

        secrets: {
            $id: '#/properties/secrets',
            type: 'object',
            patternProperties: {
                '^[a-zA-Z0-9._-]+$': {
                    $ref: '#/definitions/secret',
                },
            },
            additionalProperties: false,
        },

        configs: {
            $id: '#/properties/configs',
            type: 'object',
            patternProperties: {
                '^[a-zA-Z0-9._-]+$': {
                    $ref: '#/definitions/config',
                },
            },
            additionalProperties: false,
        },
    },

    patternProperties: { '^x-': {} },
    additionalProperties: false,

    definitions: {
        service: {
            $id: '#/definitions/service',
            type: 'object',

            properties: {
                develop: { $ref: '#/definitions/development' },
                deploy: { $ref: '#/definitions/deployment' },
                annotations: { $ref: '#/definitions/list_or_dict' },
                attach: { type: 'boolean' },
                build: {
                    oneOf: [
                        { type: 'string' },
                        {
                            type: 'object',
                            properties: {
                                context: { type: 'string' },
                                dockerfile: { type: 'string' },
                                dockerfile_inline: { type: 'string' },
                                args: { $ref: '#/definitions/list_or_dict' },
                                ssh: { $ref: '#/definitions/list_or_dict' },
                                labels: { $ref: '#/definitions/list_or_dict' },
                                cache_from: { type: 'array', items: { type: 'string' } },
                                cache_to: { type: 'array', items: { type: 'string' } },
                                no_cache: { type: 'boolean' },
                                additional_contexts: { $ref: '#/definitions/list_or_dict' },
                                network: { type: 'string' },
                                pull: { type: 'boolean' },
                                target: { type: 'string' },
                                shm_size: { type: ['integer', 'string'] },
                                extra_hosts: { $ref: '#/definitions/list_or_dict' },
                                isolation: { type: 'string' },
                                privileged: { type: 'boolean' },
                                secrets: { $ref: '#/definitions/service_config_or_secret' },
                                tags: { type: 'array', items: { type: 'string' } },
                                ulimits: { $ref: '#/definitions/ulimits' },
                                platforms: { type: 'array', items: { type: 'string' } },
                            },
                            additionalProperties: false,
                            patternProperties: { '^x-': {} },
                        },
                    ],
                },
                blkio_config: {
                    type: 'object',
                    properties: {
                        device_read_bps: {
                            type: 'array',
                            items: { $ref: '#/definitions/blkio_limit' },
                        },
                        device_read_iops: {
                            type: 'array',
                            items: { $ref: '#/definitions/blkio_limit' },
                        },
                        device_write_bps: {
                            type: 'array',
                            items: { $ref: '#/definitions/blkio_limit' },
                        },
                        device_write_iops: {
                            type: 'array',
                            items: { $ref: '#/definitions/blkio_limit' },
                        },
                        weight: { type: 'integer' },
                        weight_device: {
                            type: 'array',
                            items: { $ref: '#/definitions/blkio_weight' },
                        },
                    },
                    additionalProperties: false,
                },
                cap_add: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                cap_drop: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                cgroup: { type: 'string', enum: ['host', 'private'] },
                cgroup_parent: { type: 'string' },
                command: { $ref: '#/definitions/command' },
                configs: { $ref: '#/definitions/service_config_or_secret' },
                container_name: { type: 'string' },
                cpu_count: { type: 'integer', minimum: 0 },
                cpu_percent: { type: 'integer', minimum: 0, maximum: 100 },
                cpu_shares: { type: ['number', 'string'] },
                cpu_quota: { type: ['number', 'string'] },
                cpu_period: { type: ['number', 'string'] },
                cpu_rt_period: { type: ['number', 'string'] },
                cpu_rt_runtime: { type: ['number', 'string'] },
                cpus: { type: ['number', 'string'] },
                cpuset: { type: 'string' },
                credential_spec: {
                    type: 'object',
                    properties: {
                        config: { type: 'string' },
                        file: { type: 'string' },
                        registry: { type: 'string' },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                depends_on: {
                    oneOf: [
                        { $ref: '#/definitions/list_of_strings' },
                        {
                            type: 'object',
                            additionalProperties: false,
                            patternProperties: {
                                '^[a-zA-Z0-9._-]+$': {
                                    type: 'object',
                                    additionalProperties: false,
                                    properties: {
                                        restart: { type: 'boolean' },
                                        required: {
                                            type: 'boolean',
                                            default: true,
                                        },
                                        condition: {
                                            type: 'string',
                                            enum: [
                                                'service_started',
                                                'service_healthy',
                                                'service_completed_successfully',
                                            ],
                                        },
                                    },
                                    required: ['condition'],
                                },
                            },
                        },
                    ],
                },
                device_cgroup_rules: { $ref: '#/definitions/list_of_strings' },
                devices: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                dns: { $ref: '#/definitions/string_or_list' },
                dns_opt: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                dns_search: { $ref: '#/definitions/string_or_list' },
                domainname: { type: 'string' },
                entrypoint: { $ref: '#/definitions/command' },
                env_file: { $ref: '#/definitions/string_or_list' },
                environment: { $ref: '#/definitions/list_or_dict' },

                expose: {
                    type: 'array',
                    items: {
                        type: ['string', 'number'],
                        format: 'expose',
                    },
                    uniqueItems: true,
                },
                extends: {
                    oneOf: [
                        { type: 'string' },
                        {
                            type: 'object',

                            properties: {
                                service: { type: 'string' },
                                file: { type: 'string' },
                            },
                            required: ['service'],
                            additionalProperties: false,
                        },
                    ],
                },
                external_links: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                extra_hosts: { $ref: '#/definitions/list_or_dict' },
                group_add: {
                    type: 'array',
                    items: {
                        type: ['string', 'number'],
                    },
                    uniqueItems: true,
                },
                healthcheck: { $ref: '#/definitions/healthcheck' },
                hostname: { type: 'string' },
                image: { type: 'string' },
                init: { type: 'boolean' },
                ipc: { type: 'string' },
                isolation: { type: 'string' },
                labels: { $ref: '#/definitions/list_or_dict' },
                links: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                logging: {
                    type: 'object',

                    properties: {
                        driver: { type: 'string' },
                        options: {
                            type: 'object',
                            patternProperties: {
                                '^.+$': { type: ['string', 'number', 'null'] },
                            },
                        },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                mac_address: { type: 'string' },
                mem_limit: { type: ['number', 'string'] },
                mem_reservation: { type: ['string', 'integer'] },
                mem_swappiness: { type: 'integer' },
                memswap_limit: { type: ['number', 'string'] },
                network_mode: { type: 'string' },
                networks: {
                    oneOf: [
                        { $ref: '#/definitions/list_of_strings' },
                        {
                            type: 'object',
                            patternProperties: {
                                '^[a-zA-Z0-9._-]+$': {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            properties: {
                                                aliases: { $ref: '#/definitions/list_of_strings' },
                                                ipv4_address: { type: 'string' },
                                                ipv6_address: { type: 'string' },
                                                link_local_ips: { $ref: '#/definitions/list_of_strings' },
                                                mac_address: { type: 'string' },
                                                priority: { type: 'number' },
                                            },
                                            additionalProperties: false,
                                            patternProperties: { '^x-': {} },
                                        },
                                        { type: 'null' },
                                    ],
                                },
                            },
                            additionalProperties: false,
                        },
                    ],
                },
                oom_kill_disable: { type: 'boolean' },
                oom_score_adj: { type: 'integer', minimum: -1000, maximum: 1000 },
                pid: { type: ['string', 'null'] },
                pids_limit: { type: ['number', 'string'] },
                platform: { type: 'string' },
                ports: {
                    type: 'array',
                    items: {
                        oneOf: [
                            { type: 'number', format: 'ports' },
                            { type: 'string', format: 'ports' },
                            {
                                type: 'object',
                                properties: {
                                    mode: { type: 'string' },
                                    host_ip: { type: 'string' },
                                    target: { type: 'integer' },
                                    published: { type: ['string', 'integer'] },
                                    protocol: { type: 'string' },
                                },
                                additionalProperties: false,
                                patternProperties: { '^x-': {} },
                            },
                        ],
                    },
                    uniqueItems: true,
                },
                privileged: { type: 'boolean' },
                profiles: { $ref: '#/definitions/list_of_strings' },
                pull_policy: { type: 'string', enum: ['always', 'never', 'if_not_present', 'build', 'missing'] },
                read_only: { type: 'boolean' },
                restart: { type: 'string' },
                runtime: {
                    type: 'string',
                },
                scale: {
                    type: 'integer',
                },
                security_opt: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                shm_size: { type: ['number', 'string'] },
                secrets: { $ref: '#/definitions/service_config_or_secret' },
                sysctls: { $ref: '#/definitions/list_or_dict' },
                stdin_open: { type: 'boolean' },
                stop_grace_period: { type: 'string', format: 'duration' },
                stop_signal: { type: 'string' },
                storage_opt: { type: 'object' },
                tmpfs: { $ref: '#/definitions/string_or_list' },
                tty: { type: 'boolean' },
                ulimits: { $ref: '#/definitions/ulimits' },
                user: { type: 'string' },
                uts: { type: 'string' },
                userns_mode: { type: 'string' },
                volumes: {
                    type: 'array',
                    items: {
                        oneOf: [
                            { type: 'string', format: 'volumes' },
                            {
                                type: 'object',
                                required: ['type'],
                                properties: {
                                    type: { type: 'string' },
                                    source: { type: 'string' },
                                    target: { type: 'string' },
                                    read_only: { type: 'boolean' },
                                    consistency: { type: 'string' },
                                    bind: {
                                        type: 'object',
                                        properties: {
                                            propagation: { type: 'string' },
                                            create_host_path: { type: 'boolean' },
                                            selinux: { type: 'string', enum: ['z', 'Z'] },
                                        },
                                        additionalProperties: false,
                                        patternProperties: { '^x-': {} },
                                    },
                                    volume: {
                                        type: 'object',
                                        properties: {
                                            nocopy: { type: 'boolean' },
                                        },
                                        additionalProperties: false,
                                        patternProperties: { '^x-': {} },
                                    },
                                    tmpfs: {
                                        type: 'object',
                                        properties: {
                                            size: {
                                                oneOf: [{ type: 'integer', minimum: 0 }, { type: 'string' }],
                                            },
                                            mode: { type: 'number' },
                                        },
                                        additionalProperties: false,
                                        patternProperties: { '^x-': {} },
                                    },
                                },
                                additionalProperties: false,
                                patternProperties: { '^x-': {} },
                            },
                        ],
                    },
                    uniqueItems: true,
                },
                volumes_from: {
                    type: 'array',
                    items: { type: 'string' },
                    uniqueItems: true,
                },
                working_dir: { type: 'string' },
            },
            patternProperties: { '^x-': {} },
            additionalProperties: false,
        },

        healthcheck: {
            $id: '#/definitions/healthcheck',
            type: 'object',
            properties: {
                disable: { type: 'boolean' },
                interval: { type: 'string', format: 'duration' },
                retries: { type: 'number' },
                test: {
                    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                },
                timeout: { type: 'string', format: 'duration' },
                start_period: { type: 'string', format: 'duration' },
                start_interval: { type: 'string', format: 'duration' },
            },
            additionalProperties: false,
            patternProperties: { '^x-': {} },
        },
        development: {
            $id: '#/definitions/development',
            type: ['object', 'null'],
            properties: {
                watch: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            ignore: { type: 'array', items: { type: 'string' } },
                            path: { type: 'string' },
                            action: { type: 'string', enum: ['rebuild', 'sync', 'sync+restart'] },
                            target: { type: 'string' },
                        },
                    },
                    required: ['path', 'action'],
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
            },
        },
        deployment: {
            $id: '#/definitions/deployment',
            type: ['object', 'null'],
            properties: {
                mode: { type: 'string' },
                endpoint_mode: { type: 'string' },
                replicas: { type: 'integer' },
                labels: { $ref: '#/definitions/list_or_dict' },
                rollback_config: {
                    type: 'object',
                    properties: {
                        parallelism: { type: 'integer' },
                        delay: { type: 'string', format: 'duration' },
                        failure_action: { type: 'string' },
                        monitor: { type: 'string', format: 'duration' },
                        max_failure_ratio: { type: 'number' },
                        order: { type: 'string', enum: ['start-first', 'stop-first'] },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                update_config: {
                    type: 'object',
                    properties: {
                        parallelism: { type: 'integer' },
                        delay: { type: 'string', format: 'duration' },
                        failure_action: { type: 'string' },
                        monitor: { type: 'string', format: 'duration' },
                        max_failure_ratio: { type: 'number' },
                        order: { type: 'string', enum: ['start-first', 'stop-first'] },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                resources: {
                    type: 'object',
                    properties: {
                        limits: {
                            type: 'object',
                            properties: {
                                cpus: { type: ['number', 'string'] },
                                memory: { type: 'string' },
                                pids: { type: 'integer' },
                            },
                            additionalProperties: false,
                            patternProperties: { '^x-': {} },
                        },
                        reservations: {
                            type: 'object',
                            properties: {
                                cpus: { type: ['number', 'string'] },
                                memory: { type: 'string' },
                                generic_resources: { $ref: '#/definitions/generic_resources' },
                                devices: { $ref: '#/definitions/devices' },
                            },
                            additionalProperties: false,
                            patternProperties: { '^x-': {} },
                        },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                restart_policy: {
                    type: 'object',
                    properties: {
                        condition: { type: 'string' },
                        delay: { type: 'string', format: 'duration' },
                        max_attempts: { type: 'integer' },
                        window: { type: 'string', format: 'duration' },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                placement: {
                    type: 'object',
                    properties: {
                        constraints: { type: 'array', items: { type: 'string' } },
                        preferences: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    spread: { type: 'string' },
                                },
                                additionalProperties: false,
                                patternProperties: { '^x-': {} },
                            },
                        },
                        max_replicas_per_node: { type: 'integer' },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
            },
            additionalProperties: false,
            patternProperties: { '^x-': {} },
        },

        generic_resources: {
            $id: '#/definitions/generic_resources',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    discrete_resource_spec: {
                        type: 'object',
                        properties: {
                            kind: { type: 'string' },
                            value: { type: 'number' },
                        },
                        additionalProperties: false,
                        patternProperties: { '^x-': {} },
                    },
                },
                additionalProperties: false,
                patternProperties: { '^x-': {} },
            },
        },

        devices: {
            $id: '#/definitions/devices',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    capabilities: { $ref: '#/definitions/list_of_strings' },
                    count: { type: ['string', 'integer'] },
                    device_ids: { $ref: '#/definitions/list_of_strings' },
                    driver: { type: 'string' },
                    options: { $ref: '#/definitions/list_or_dict' },
                },
                additionalProperties: false,
                patternProperties: { '^x-': {} },
            },
        },

        include: {
            $id: '#/definitions/include',
            oneOf: [
                { type: 'string' },
                {
                    type: 'object',
                    properties: {
                        path: { $ref: '#/definitions/string_or_list' },
                        env_file: { $ref: '#/definitions/string_or_list' },
                        project_directory: { type: 'string' },
                    },
                    additionalProperties: false,
                },
            ],
        },

        network: {
            $id: '#/definitions/network',
            type: ['object', 'null'],
            properties: {
                name: { type: 'string' },
                driver: { type: 'string' },
                driver_opts: {
                    type: 'object',
                    patternProperties: {
                        '^.+$': { type: ['string', 'number'] },
                    },
                },
                ipam: {
                    type: 'object',
                    properties: {
                        driver: { type: 'string' },
                        config: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    subnet: { type: 'string', format: 'subnet_ip_address' },
                                    ip_range: { type: 'string' },
                                    gateway: { type: 'string' },
                                    aux_addresses: {
                                        type: 'object',
                                        additionalProperties: false,
                                        patternProperties: { '^.+$': { type: 'string' } },
                                    },
                                },
                                additionalProperties: false,
                                patternProperties: { '^x-': {} },
                            },
                        },
                        options: {
                            type: 'object',
                            additionalProperties: false,
                            patternProperties: { '^.+$': { type: 'string' } },
                        },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                external: {
                    type: ['boolean', 'object'],
                    properties: {
                        name: {
                            deprecated: true,
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                internal: { type: 'boolean' },
                enable_ipv6: { type: 'boolean' },
                attachable: { type: 'boolean' },
                labels: { $ref: '#/definitions/list_or_dict' },
            },
            additionalProperties: false,
            patternProperties: { '^x-': {} },
        },

        volume: {
            $id: '#/definitions/volume',
            type: ['object', 'null'],
            properties: {
                name: { type: 'string' },
                driver: { type: 'string' },
                driver_opts: {
                    type: 'object',
                    patternProperties: {
                        '^.+$': { type: ['string', 'number'] },
                    },
                },
                external: {
                    type: ['boolean', 'object'],
                    properties: {
                        name: {
                            deprecated: true,
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                    patternProperties: { '^x-': {} },
                },
                labels: { $ref: '#/definitions/list_or_dict' },
            },
            additionalProperties: false,
            patternProperties: { '^x-': {} },
        },

        secret: {
            $id: '#/definitions/secret',
            type: 'object',
            properties: {
                name: { type: 'string' },
                environment: { type: 'string' },
                file: { type: 'string' },
                external: {
                    type: ['boolean', 'object'],
                    properties: {
                        name: { type: 'string' },
                    },
                },
                labels: { $ref: '#/definitions/list_or_dict' },
                driver: { type: 'string' },
                driver_opts: {
                    type: 'object',
                    patternProperties: {
                        '^.+$': { type: ['string', 'number'] },
                    },
                },
                template_driver: { type: 'string' },
            },
            additionalProperties: false,
            patternProperties: { '^x-': {} },
        },

        config: {
            $id: '#/definitions/config',
            type: 'object',
            properties: {
                name: { type: 'string' },
                content: { type: 'string' },
                environment: { type: 'string' },
                file: { type: 'string' },
                external: {
                    type: ['boolean', 'object'],
                    properties: {
                        name: {
                            deprecated: true,
                            type: 'string',
                        },
                    },
                },
                labels: { $ref: '#/definitions/list_or_dict' },
                template_driver: { type: 'string' },
            },
            additionalProperties: false,
            patternProperties: { '^x-': {} },
        },

        command: {
            oneOf: [{ type: 'null' }, { type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },

        string_or_list: {
            oneOf: [{ type: 'string' }, { $ref: '#/definitions/list_of_strings' }],
        },

        list_of_strings: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
        },

        list_or_dict: {
            oneOf: [
                {
                    type: 'object',
                    patternProperties: {
                        '.+': {
                            type: ['string', 'number', 'boolean', 'null'],
                        },
                    },
                    additionalProperties: false,
                },
                { type: 'array', items: { type: 'string' }, uniqueItems: true },
            ],
        },

        blkio_limit: {
            type: 'object',
            properties: {
                path: { type: 'string' },
                rate: { type: ['integer', 'string'] },
            },
            additionalProperties: false,
        },
        blkio_weight: {
            type: 'object',
            properties: {
                path: { type: 'string' },
                weight: { type: 'integer' },
            },
            additionalProperties: false,
        },
        service_config_or_secret: {
            type: 'array',
            items: {
                oneOf: [
                    { type: 'string' },
                    {
                        type: 'object',
                        properties: {
                            source: { type: 'string' },
                            target: { type: 'string' },
                            uid: { type: 'string' },
                            gid: { type: 'string' },
                            mode: { type: 'number' },
                        },
                        additionalProperties: false,
                        patternProperties: { '^x-': {} },
                    },
                ],
            },
        },
        ulimits: {
            type: 'object',
            patternProperties: {
                '^[a-z]+$': {
                    oneOf: [
                        { type: 'integer' },
                        {
                            type: 'object',
                            properties: {
                                hard: { type: 'integer' },
                                soft: { type: 'integer' },
                            },
                            required: ['soft', 'hard'],
                            additionalProperties: false,
                            patternProperties: { '^x-': {} },
                        },
                    ],
                },
            },
        },
        constraints: {
            service: {
                $id: '#/definitions/constraints/service',
                anyOf: [{ required: ['build'] }, { required: ['image'] }],
                properties: {
                    build: {
                        required: ['context'],
                    },
                },
            },
        },
    },
};
