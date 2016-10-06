<?php
function ip() 
{ 
    if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')) 
    { 
        $ip = getenv('HTTP_CLIENT_IP'); 
    } 
    elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) 
    { 
        $ip = getenv('HTTP_X_FORWARDED_FOR'); 
    } 
    elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) 
    { 
        $ip = getenv('REMOTE_ADDR'); 
    } 
    elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) 
    { 
        $ip = $_SERVER['REMOTE_ADDR']; 
    } 
    return preg_match("/[\d\.]{7,15}/", $ip, $matches) ? $matches[0] : 'unknown'; 
} 
$ip=ip(); 
$times=date("Y-m-d"); 
$time=date("Y-m-d H:i:s"); 
$str=$ip." ".$time; 
$l=fopen("log/$times.txt","a+"); 
fwrite($l,$str. "\n"); 
fclose($l); 

$res = array('result'=>0, 'info'=>'', 'bin'=>'');
//创建临时目录
$dirname =  "stm8_" . strval(getmypid());
if(mkdir($dirname)) 
{
    //创建app.c，拷入代码
    chdir($dirname);
    $file = fopen("app.c", "w+");
    fwrite($file, file_get_contents("php://input"));
    fclose($file);
    //调用wine
    exec("wine ../make -f ../Makefile", $output, $return_var);
    if($return_var == 0)    //执行成功
    {
        $res['result'] = 1;
        $filename = "app.bin";
        $handle = fopen($filename, "r");
        $contents = fread($handle, filesize ($filename));
        fclose($handle);
        $res['bin'] = base64_encode($contents);
    }
    else    //失败
    {
        //nothing
    }
    //生成编译信息
    $res['info'] = implode
    (   " ", 
        array_merge(
            array("编译结果:\n"),file_exists("c.txt")?array_slice(file("c.txt"),4):array("无\n"),
            array("链接结果:\n"),file_exists("l.txt")?array_slice(file("l.txt"),3):array("无\n"),
            array("转换结果:\n"),file_exists("b.txt")?array_slice(file("b.txt"),4):array("无\n")
        )
    );  //融合转换结果
    $res['info'] = str_replace
    (   "\"Z:\\www\\uclink.org\\_\\STM8_app\\", "\"", 
        $res['info']
    );  //替换无关字符
    //删除临时目录
    chdir("../");
    $file = fopen("app.log", "w+");
    fwrite($file,  $res['info']);
    fclose($file);
    exec("rm -rf $dirname");
}
else 
{
    $res['info'] = '临时文件夹创建失败!';
}
//返回结果
echo json_encode($res);
?>
