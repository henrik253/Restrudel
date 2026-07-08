setcpm(110)

$: s("bd bd").clip(1).release(2.0323).gain(.5)
$: n("0 ~ 1 2*3 ~").s("vocal 1").room(.25).delay(.5).gain(0.60)
$: n("0 1 2 3").sound("square ~").lpf(3000).gain(0.30)
