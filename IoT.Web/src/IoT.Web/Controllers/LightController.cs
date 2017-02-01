using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace IoT.Web.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("AllowSpecificOrigin")]
    [Authorize]
    public class LightController : Controller
    {
        // GET: api/light/status
        [HttpGet("status")]
        public IActionResult Status()
        {
            var next = new Random().Next(100);
            bool status = (next % 2) == 0;

            var result = new {
                Name = User.Identity.Name,
                Status = status
            };

            return new ObjectResult(result);
        }

        // POST api/light/on
        [HttpPost("on")]
        public IActionResult On()
        {
            return Ok();
        }

        // POST api/light/off
        [HttpPost("off")]
        public IActionResult Off()
        {
            return Ok();
        }
    }
}
