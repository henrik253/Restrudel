setcpm(128/4)
$: s("bd*2 sd bd*2 sd").gain("[.8 .4]*2").release(.06).attack(.02)
$: n("9*2 8 ~ 7").scale("D1:hirajoshi").s("triangle").struct("[~ x]*2").gain(.4).release(.1)
$: n("-3 0 0 -3 0 0 -3 0").scale("D1:hirajoshi").s("triangle").hpf(1500).lpf(3000).release(.05).attack(.02).gain(.2)
