setcpm(105/4)
$: s("hh*4 ~ sd bd").gain(.7)
$: s("gm_epiano1:1 gm_choir_aahs:2").gain("[.5 .3]*4").release(2.5)
$: n("9 5 7 10 4 7").scale("c4:major").s("sawtooth").lpf(900).gain(.35)
