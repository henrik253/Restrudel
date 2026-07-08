setcpm(128/4)
$: s("bd*4 bd!4").bank("RolandTR909").gain(.85)
$: s("hh*8").gain(.2)
$: s("gm_electric_guitar_clean:2 noise*4").gain(.4).lpf("<800 1000 1500>").room(.6).delay(.3)
