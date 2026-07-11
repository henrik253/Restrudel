setcpm(96/4)
$: s("gm_tuba ~ cp ~").slow(2).gain(.5).room(.28)
$: n("-3 -3 -3 -1 -1 -4").scale("C4:bebop:major").s("sawtooth").gain(.4).lpf(1000).resonance(10).room(.2).delay(.5)
$: s("hh*8").gain(.15)
