setcpm(125/4)
$: s("hh*4 ~ sd cp").lpf(3500).hpf("<2000!3 <4000 8000>>*4").gain(.6)
$: s("bd ~ ~ ~").bank("RolandTR909").gain(.8)
$: s("square shaker*16").gain(.3)
