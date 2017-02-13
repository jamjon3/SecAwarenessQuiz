node('master') {
  env.NODEJS_HOME = tool 'nodejs'
  env.PATH = "${env.JENKINS_HOME}/bin:${env.NODEJS_HOME}/bin:${env.PATH}"
  checkout scm
  stage('Build NodeJS Deps') {
    sh 'npm install'
  }
  stage('Build Bower Deps') {
    sh 'node_modules/bower/bin/bower install'
  }
  stage('Setup composer') {
    sh "mkdir -p ${env.JENKINS_HOME}/bin"
    sh "ls ${env.JENKINS_HOME}/bin/composer"
    sh "rm -Rf ${env.JENKINS_HOME}/bin/composer"
    sh "curl -sS https://getcomposer.org/installer | php -- --install-dir=${env.JENKINS_HOME}/bin --filename=composer"
  }
  stage('Run Grunt build') {    
    sh 'node_modules/grunt-cli/bin/grunt build'
    // sh 'mkdir -p tmp'
  }
//  stage('Build Security Awareness Quiz') {  
//    sh "vagrant halt --force || true"
//    sh "vagrant global-status --prune || true"
//    sh "vagrant destroy armvm --force || true"
//    sh "VBoxManage controlvm armvm poweroff || true"
//    sh "VBoxManage unregistervm armvm --delete || true"
//    sh "rm -Rf '${env.JENKINS_HOME}/VirtualBox VMs/armvm/'"
//    env.ANSIBLE_TAGS = 'build'
//    sh "vagrant up --provision --provider virtualbox"
//    sh "vagrant halt --force || true"
//    sh "vagrant global-status --prune || true"
//    sh "vagrant destroy armvm --force || true"
//    sh "VBoxManage controlvm armvm poweroff || true"
//    sh "VBoxManage unregistervm armvm --delete || true"
//    sh "rm -Rf '${env.JENKINS_HOME}/VirtualBox VMs/armvm/'"
    // dir('rpms') {
      // archiveArtifacts artifacts: '*.rpm'
      // stash name: "armrpm", includes: "arm*.rpm"
    // }
//  }

}
