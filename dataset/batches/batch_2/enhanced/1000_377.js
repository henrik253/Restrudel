setcpm(100/4)
$: s("bd cr").slow(4).gain(.7)
$: s("rd*3").gain(.3)
$: note("c2*4 e1").sound("gm_piccolo").clip(.8).gain(.4).release(.1).attack(.001)
