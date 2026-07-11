setcpm(110)

$: n(5).s("misc:2 cp*2 sd*3 sd*2").lpf(1000).gain(0.28).release(.01).hpf(300).speed(.95).velocity(.2)
$: n("0 1 2 3").sound("triangle kick").lpf(3000).room(.7).gain(.5)
$: n("0 1 2 3").s("bd*4 sd*2 cp*8 gm_violin").gain(0.50)
