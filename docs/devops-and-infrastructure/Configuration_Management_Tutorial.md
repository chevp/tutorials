# Configuration Management Tutorial (Ansible, Chef, Puppet)

## Overview

Configuration management tools automate the deployment, configuration, and management of infrastructure and applications. They ensure consistency, reduce manual errors, and enable infrastructure as code practices.

## Ansible

### Installation and Setup

```bash
# Install Ansible (Ubuntu/Debian)
sudo apt update
sudo apt install ansible

# Install via pip
pip install ansible

# Verify installation
ansible --version
```

### Inventory Configuration

**Static Inventory**:

```ini
# inventory.ini
[webservers]
web1.example.com ansible_host=192.168.1.10
web2.example.com ansible_host=192.168.1.11

[databases]
db1.example.com ansible_host=192.168.1.20
db2.example.com ansible_host=192.168.1.21

[production:children]
webservers
databases

[production:vars]
ansible_user=admin
ansible_ssh_private_key_file=~/.ssh/production.pem
```

**Dynamic Inventory (AWS)**:

```yaml
# aws_ec2.yml
plugin: aws_ec2
regions:
  - us-east-1
  - us-west-2
keyed_groups:
  - key: tags.Environment
    prefix: env
  - key: instance_type
    prefix: instance_type
hostnames:
  - network-interface.association.public-ip
  - dns-name
filters:
  instance-state-name: running
```

### Playbooks

**Basic Playbook Structure**:

```yaml
# webserver.yml
---
- name: Configure web servers
  hosts: webservers
  become: yes
  vars:
    nginx_port: 80
    app_user: webapp

  tasks:
    - name: Install Nginx
      package:
        name: nginx
        state: present

    - name: Start and enable Nginx
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Create application user
      user:
        name: "{{ app_user }}"
        system: yes
        shell: /bin/bash
        home: /var/www

    - name: Copy Nginx configuration
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        backup: yes
      notify: restart nginx

    - name: Deploy application
      git:
        repo: https://github.com/company/webapp.git
        dest: /var/www/app
        version: "{{ app_version | default('main') }}"
      become_user: "{{ app_user }}"
      notify: restart application

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted

    - name: restart application
      systemd:
        name: webapp
        state: restarted
```

**Advanced Playbook with Roles**:

```yaml
# site.yml
---
- name: Deploy infrastructure
  hosts: all
  gather_facts: yes

- name: Configure database servers
  hosts: databases
  roles:
    - common
    - mysql
  vars:
    mysql_root_password: "{{ vault_mysql_root_password }}"

- name: Configure web servers
  hosts: webservers
  roles:
    - common
    - nginx
    - application
  vars:
    app_environment: production
```

### Roles Structure

```
roles/
├── common/
│   ├── tasks/main.yml
│   ├── handlers/main.yml
│   ├── templates/
│   ├── files/
│   ├── vars/main.yml
│   └── defaults/main.yml
├── nginx/
│   ├── tasks/main.yml
│   ├── templates/nginx.conf.j2
│   └── handlers/main.yml
└── mysql/
    ├── tasks/main.yml
    ├── templates/my.cnf.j2
    └── defaults/main.yml
```

**Common Role Example**:

```yaml
# roles/common/tasks/main.yml
---
- name: Update package cache
  package:
    update_cache: yes
  when: ansible_os_family == "Debian"

- name: Install essential packages
  package:
    name:
      - curl
      - wget
      - unzip
      - git
      - htop
    state: present

- name: Configure timezone
  timezone:
    name: "{{ system_timezone | default('UTC') }}"

- name: Setup SSH hardening
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "{{ item.regexp }}"
    line: "{{ item.line }}"
    backup: yes
  loop:
    - { regexp: '^#?PermitRootLogin', line: 'PermitRootLogin no' }
    - { regexp: '^#?PasswordAuthentication', line: 'PasswordAuthentication no' }
    - { regexp: '^#?Port', line: 'Port {{ ssh_port | default(22) }}' }
  notify: restart sshd

- name: Configure firewall
  ufw:
    rule: allow
    port: "{{ item }}"
    proto: tcp
  loop:
    - "{{ ssh_port | default(22) }}"
    - 80
    - 443
  when: ansible_os_family == "Debian"
```

### Ansible Vault

```bash
# Create encrypted file
ansible-vault create secrets.yml

# Edit encrypted file
ansible-vault edit secrets.yml

# Encrypt existing file
ansible-vault encrypt vars/passwords.yml

# Run playbook with vault
ansible-playbook -i inventory.ini site.yml --ask-vault-pass
```

**Vault Content Example**:

```yaml
# secrets.yml (encrypted)
vault_mysql_root_password: super_secret_password
vault_api_key: abcd1234567890
vault_ssl_private_key: |
  -----BEGIN PRIVATE KEY-----
  MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
  -----END PRIVATE KEY-----
```

## Chef

### Installation and Setup

```bash
# Install Chef Workstation
curl -L https://omnitruck.chef.io/install.sh | sudo bash -s -- -P chef-workstation

# Initialize Chef repository
chef generate repo my-chef-repo
cd my-chef-repo
```

### Cookbooks

**Generate Cookbook**:

```bash
# Create cookbook
chef generate cookbook cookbooks/webapp
cd cookbooks/webapp
```

**Cookbook Structure**:

```
webapp/
├── Berksfile
├── chefignore
├── kitchen.yml
├── metadata.rb
├── README.md
├── recipes/
│   └── default.rb
├── spec/
│   └── unit/recipes/default_spec.rb
├── test/
│   └── integration/default/default_test.rb
├── attributes/
│   └── default.rb
├── files/
│   └── default/
├── templates/
│   └── default/
└── libraries/
```

**Recipe Example**:

```ruby
# recipes/default.rb
#
# Cookbook:: webapp
# Recipe:: default

# Install packages
package %w(nginx git nodejs npm) do
  action :install
end

# Create application user
user 'webapp' do
  system true
  shell '/bin/bash'
  home '/var/www'
  manage_home true
end

# Create application directory
directory '/var/www/app' do
  owner 'webapp'
  group 'webapp'
  mode '0755'
  action :create
end

# Deploy application from git
git '/var/www/app' do
  repository node['webapp']['git_repo']
  revision node['webapp']['git_branch']
  user 'webapp'
  group 'webapp'
  action :sync
end

# Install npm dependencies
execute 'npm install' do
  cwd '/var/www/app'
  user 'webapp'
  group 'webapp'
  command 'npm install --production'
  action :run
end

# Configure nginx
template '/etc/nginx/sites-available/webapp' do
  source 'nginx-webapp.conf.erb'
  variables(
    server_name: node['webapp']['server_name'],
    app_port: node['webapp']['port']
  )
  notifies :reload, 'service[nginx]', :delayed
end

# Enable nginx site
link '/etc/nginx/sites-enabled/webapp' do
  to '/etc/nginx/sites-available/webapp'
  notifies :reload, 'service[nginx]', :delayed
end

# Create systemd service
template '/etc/systemd/system/webapp.service' do
  source 'webapp.service.erb'
  variables(
    app_user: 'webapp',
    app_path: '/var/www/app',
    app_port: node['webapp']['port']
  )
  notifies :run, 'execute[systemctl daemon-reload]', :immediately
  notifies :restart, 'service[webapp]', :delayed
end

execute 'systemctl daemon-reload' do
  command 'systemctl daemon-reload'
  action :nothing
end

# Start and enable services
service 'nginx' do
  action [:enable, :start]
end

service 'webapp' do
  action [:enable, :start]
end
```

**Attributes File**:

```ruby
# attributes/default.rb
default['webapp']['git_repo'] = 'https://github.com/company/webapp.git'
default['webapp']['git_branch'] = 'master'
default['webapp']['port'] = 3000
default['webapp']['server_name'] = 'webapp.example.com'

# Environment-specific overrides
case node.chef_environment
when 'production'
  default['webapp']['git_branch'] = 'production'
  default['webapp']['server_name'] = 'app.example.com'
when 'staging'
  default['webapp']['git_branch'] = 'staging'
  default['webapp']['server_name'] = 'staging.example.com'
end
```

**Template Example**:

```erb
# templates/default/nginx-webapp.conf.erb
server {
    listen 80;
    server_name <%= @server_name %>;

    location / {
        proxy_pass http://127.0.0.1:<%= @app_port %>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
```

### Chef Environments

```ruby
# environments/production.rb
name 'production'
description 'Production environment'

cookbook_versions({
  'webapp' => '= 1.0.0',
  'nginx' => '~> 2.7.0'
})

override_attributes({
  'webapp' => {
    'git_branch' => 'production',
    'server_name' => 'app.example.com'
  }
})
```

## Puppet

### Installation and Setup

```bash
# Install Puppet Agent
curl -O https://apt.puppetlabs.com/puppet7-release-focal.deb
sudo dpkg -i puppet7-release-focal.deb
sudo apt update
sudo apt install puppet-agent

# Install Puppet Server
sudo apt install puppetserver
```

### Manifests

**Basic Manifest**:

```puppet
# site.pp
node 'web1.example.com' {
  include webapp
  include nginx
}

node 'db1.example.com' {
  include mysql
  include backup
}

node default {
  include common
}
```

**Module Structure**:

```
modules/webapp/
├── manifests/
│   ├── init.pp
│   ├── install.pp
│   ├── config.pp
│   └── service.pp
├── templates/
│   └── webapp.service.epp
├── files/
│   └── webapp.conf
├── lib/
├── facts.d/
└── spec/
```

**Module Example**:

```puppet
# modules/webapp/manifests/init.pp
class webapp (
  String $app_user = 'webapp',
  String $app_home = '/var/www',
  String $git_repo = 'https://github.com/company/webapp.git',
  String $git_branch = 'master',
  Integer $app_port = 3000,
) {
  contain webapp::install
  contain webapp::config
  contain webapp::service

  Class['webapp::install']
  -> Class['webapp::config']
  ~> Class['webapp::service']
}
```

```puppet
# modules/webapp/manifests/install.pp
class webapp::install {
  package { ['git', 'nodejs', 'npm']:
    ensure => present,
  }

  user { $webapp::app_user:
    ensure     => present,
    system     => true,
    home       => $webapp::app_home,
    managehome => true,
    shell      => '/bin/bash',
  }

  file { "${webapp::app_home}/app":
    ensure => directory,
    owner  => $webapp::app_user,
    group  => $webapp::app_user,
    mode   => '0755',
  }

  vcsrepo { "${webapp::app_home}/app":
    ensure   => present,
    provider => git,
    source   => $webapp::git_repo,
    revision => $webapp::git_branch,
    owner    => $webapp::app_user,
    group    => $webapp::app_user,
    require  => [User[$webapp::app_user], File["${webapp::app_home}/app"]],
  }
}
```

```puppet
# modules/webapp/manifests/service.pp
class webapp::service {
  file { '/etc/systemd/system/webapp.service':
    ensure  => file,
    content => epp('webapp/webapp.service.epp', {
      'app_user' => $webapp::app_user,
      'app_home' => $webapp::app_home,
      'app_port' => $webapp::app_port,
    }),
    notify  => [Exec['systemd-reload'], Service['webapp']],
  }

  exec { 'systemd-reload':
    command     => '/bin/systemctl daemon-reload',
    refreshonly => true,
  }

  service { 'webapp':
    ensure => running,
    enable => true,
  }
}
```

**Template Example**:

```
# modules/webapp/templates/webapp.service.epp
[Unit]
Description=Web Application
After=network.target

[Service]
Type=simple
User=<%= $app_user %>
WorkingDirectory=<%= $app_home %>/app
ExecStart=/usr/bin/node server.js
Environment=PORT=<%= $app_port %>
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Hiera Configuration

```yaml
# hiera.yaml
---
version: 5
defaults:
  datadir: data
  data_hash: yaml_data
hierarchy:
  - name: "Per-node data"
    path: "nodes/%{trusted.certname}.yaml"
  - name: "Per-environment data"
    path: "environments/%{server_facts.environment}.yaml"
  - name: "Per-role data"
    path: "roles/%{facts.role}.yaml"
  - name: "Common data"
    path: "common.yaml"
```

**Hiera Data Example**:

```yaml
# data/common.yaml
webapp::app_port: 3000
webapp::git_repo: 'https://github.com/company/webapp.git'

# data/environments/production.yaml
webapp::git_branch: 'production'
webapp::app_port: 8080

# data/nodes/web1.example.com.yaml
webapp::git_branch: 'hotfix-123'
```

## Comparison and Best Practices

### Tool Comparison

| Feature | Ansible | Chef | Puppet |
|---------|---------|------|--------|
| Architecture | Agentless | Agent-based | Agent-based |
| Language | YAML | Ruby DSL | Puppet DSL |
| Learning Curve | Easy | Moderate | Moderate |
| Idempotency | Yes | Yes | Yes |
| Scalability | Good | Excellent | Excellent |
| Windows Support | Good | Excellent | Good |

### Best Practices

**1. Version Control Everything**:

```bash
# Git repository structure
infrastructure/
├── ansible/
│   ├── inventories/
│   ├── playbooks/
│   ├── roles/
│   └── group_vars/
├── chef/
│   ├── cookbooks/
│   ├── environments/
│   └── roles/
└── puppet/
    ├── modules/
    ├── manifests/
    └── hieradata/
```

**2. Environment Separation**:

```yaml
# environments/development.yml
db_host: dev-db.internal
app_debug: true
ssl_enabled: false

# environments/production.yml
db_host: prod-db.internal
app_debug: false
ssl_enabled: true
```

**3. Testing and Validation**:

**Ansible Testing**:

```bash
# Syntax check
ansible-playbook --syntax-check site.yml

# Dry run
ansible-playbook --check site.yml

# Testing with Molecule
molecule test
```

**Chef Testing**:

```bash
# Syntax check
cookstyle cookbooks/webapp

# Unit tests
chef exec rspec

# Integration tests
kitchen test
```

**4. Security Practices**:

```yaml
# Ansible - Use vault for secrets
mysql_root_password: "{{ vault_mysql_root_password }}"

# Separate sensitive data
- name: Deploy SSL certificates
  copy:
    content: "{{ ssl_private_key }}"
    dest: /etc/ssl/private/app.key
    mode: '0600'
    owner: root
    group: root
```

**5. Monitoring and Logging**:

```yaml
# Ansible callback plugins
[defaults]
callback_plugins = ~/.ansible/plugins/callback
stdout_callback = json
log_path = /var/log/ansible.log

# Chef audit cookbook
audit_cookbook 'system_compliance' do
  compliance_profile 'linux-baseline'
end
```

Configuration management tools are essential for maintaining consistent, scalable infrastructure. Choose the tool that best fits your team's expertise and infrastructure requirements, and always follow infrastructure as code principles.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
