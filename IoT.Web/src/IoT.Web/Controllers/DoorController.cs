using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace IoT.Web.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("AllowSpecificOrigin")]
    [Authorize]
    public class DoorController : Controller
    {
        // GET: api/door/status
        [HttpGet("status")]
        public IActionResult Status()
        {
            var next = new Random().Next(100);
            bool status = (next % 2) == 0;

            var result = new
            {
                Name = User.Identity.Name,
                Status = status
            };

            return new ObjectResult(result);
        }

        // POST api/door/open
        [HttpPost("open")]
        public IActionResult Open()
        {
            return Ok();
        }

        // POST api/door/close
        [HttpPost("close")]
        public IActionResult Close()
        {
            return Ok();
        }
    }
}
