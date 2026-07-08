setcpm(100/4)
$: s("kick ~ ~ ~").gain(.8)
$: s("gm_drawbar_organ shaker*8").lpf(1366).gain(.3)
$: note("g5 c5 e5 a5").sound("triangle").lpf(2000).room(.5).gain(.4).release(.1).attack(.05)
