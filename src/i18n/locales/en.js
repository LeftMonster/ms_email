export default {
  common: {
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No data',
    all: 'All'
  },
  login: {
    title: 'Login',
    description: 'Sign in to the system with your account.',
    email: 'Email',
    password: 'Password',
    loginButton: 'Login',
    processing: 'Processing...',
    noAccount: 'No account yet? Register now'
  },
  register: {
    title: 'Register',
    description: 'Create a new account.',
    email: 'Email',
    phone: 'Phone number (optional)',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    registerButton: 'Register',
    processing: 'Processing...',
    hasAccount: 'Already have an account? Login'
  },
  sidebar: {
    emailAssistant: 'Email Assistant',
    microsoftEmail: 'Microsoft Email',
    createTask: 'Create Task',
    taskList: 'Task List',
    emailTools: 'Email Tools',  // Make sure this exists
    subscriptionPlans: 'Subscription Plans',  // This was missing
    logout: 'Logout'
  },
  mailu: {
    title: 'Mailu Deployment Tool',
    subtitle: 'Generate Mailu Mail Server Deployment Script',
    server_ip: 'Server IP',
    server_ip_placeholder: 'Enter the target server\'s public IP address',
    domain: 'Domain',
    domain_placeholder: 'Enter the domain for your mail service',
    domain_provider: 'Domain Provider',
    select_provider: 'Select Domain Provider',
    domain_token: 'Domain Token',
    domain_token_placeholder: 'Enter your domain provider\'s API token',
    generate_script: 'Generate Deployment Script',
    generating: 'Generating Script...',
    help: {
      server_ip: 'The public IP address of the server where Mailu will be deployed',
      domain: 'The domain name you want to use for your mail service',
      domain_provider: 'Choose the DNS provider for your domain',
      domain_token: 'API token from your domain provider to configure DNS automatically'
    }
  }
}