## Commands to remember
sf org create scratch --definition-file config/project-scratch-def.json --set-default --alias scratch03 --duration-days 30 --target-dev-hub devhub
sf project deploy start --target-org scratch03
sf org display --target-org scratch03 --json
sf org open --target-org scratch_zeus