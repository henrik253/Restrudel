setcpm(105/4)
$: s("sd hh").slow(2).bank("RolandTR909").gain(.7)
$: n("-3 -3").scale("<Bb4:minor A4:lydian>/2").struct("x*3").s("sawtooth").gain("[.2 .4@3]*2").release(1.2)
$: sound("triangle").lpf(3000).gain(.35)
