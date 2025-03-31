class DeployProcess {
  constructor() {
    this.deployScriptPath = '/Users/ceschen/Desktop/webweaver test/deploy.sh';
  }

  async start() {
    try {
      const response = await fetch('/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`部署失败: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('部署过程出错:', error);
      throw error;
    }
  }
}

// 确保 DeployProcess 只被声明一次
if (typeof window !== 'undefined' && !window.DeployProcess) {
  window.DeployProcess = DeployProcess;
}