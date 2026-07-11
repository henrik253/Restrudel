setcpm(126/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: s("hh*2 hh*3").crush(8).delay(.3452).delaytime(.0924).gain("[.3 .2 .15 .1]*2").clip(1).lpf(3592).attack(.05)
$: s("psaltery_pluck").velocity(.7).gain(.4)
