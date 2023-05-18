#include <boost/asio.hpp>
#include <boost/beast.hpp>
#include <boost/beast/websocket.hpp>
#include <iostream>
#include <memory>

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ip = boost::asio::ip;
using tcp = boost::asio::ip::tcp;

class Session : public std::enable_shared_from_this<Session>
{
public:
    explicit Session(tcp::socket socket)
        : ws_(std::move(socket))
    {
    }

    void run()
    {
        ws_.async_accept(beast::bind_front_handler(&Session::on_accept, shared_from_this()));
    }

private:
    void on_accept(beast::error_code ec)
    {
        if (ec)
        {
            std::cerr << "Accept error: " << ec.message() << std::endl;
            return;
        }

        // You can now read and write WebSocket messages
        // by calling ws_.async_read and ws_.async_write methods
    }

    websocket::stream<tcp::socket> ws_;
};

int main()
{
    try
    {
        auto const address = net::ip::make_address("0.0.0.0");
        auto const port = static_cast<unsigned short>(std::atoi("8080"));

        net::io_context ioc{1};

        tcp::acceptor acceptor{ioc, {address, port}};
        std::cout << "WebSocket server listening on: " << address << ":" << port << std::endl;

        for (;;)
        {
            tcp::socket socket{ioc};
            acceptor.accept(socket);

            std::make_shared<Session>(std::move(socket))->run();
        }
    }
    catch (std::exception const &e)
    {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}
