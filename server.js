const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static('.'));

app.post('/deploy', (req, res) => {
    try {
        const deployScriptPath = path.join(__dirname, 'deploy.sh');
        const child = spawn('sh', [deployScriptPath]);

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`部署失败，退出码: ${code}`);
                return res.status(500).json({
                    success: false,
                    error: 'DEPLOYMENT_FAILED',
                    message: `部署失败，退出码: ${code}`,
                    details: errorOutput
                });
            }
            console.log('部署成功');
            res.status(200).json({
                success: true,
                message: '部署成功',
                output: output
            });
        });
    } catch (error) {
        console.error('部署过程中发生错误:', error);
        res.status(500).json({
            success: false,
            error: 'DEPLOYMENT_FAILED',
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
});